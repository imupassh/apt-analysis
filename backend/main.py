from contextlib import closing

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database.db import get_connection


app = FastAPI(title="부동산 실거래 분석 API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def fetch_all(query: str, parameters: tuple = ()) -> list[dict]:
    with closing(get_connection()) as connection, closing(connection.cursor()) as cursor:
        cursor.execute(query, parameters)
        columns = [column.name for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


@app.get("/")
def root():
    return {"message": "api 정상"}


@app.get("/api/regions/sidos")
def list_sidos():
    return fetch_all("SELECT DISTINCT sido_name FROM region WHERE is_active ORDER BY sido_name")


@app.get("/api/regions/sigungus")
def list_sigungus(sido_name: str = Query(min_length=1)):
    return fetch_all(
        """
        SELECT DISTINCT sgg_cd, sigungu_name FROM region
        WHERE is_active AND sido_name = %s AND sgg_cd IS NOT NULL AND sigungu_name IS NOT NULL
        ORDER BY sigungu_name
        """,
        (sido_name,),
    )


@app.get("/api/regions/eupmyeondongs")
def list_eupmyeondongs(sgg_cd: str = Query(pattern=r"^\d{5}$")):
    return fetch_all(
        """
        SELECT legal_dong_code, eup_myeon_dong_name FROM region
        WHERE is_active AND administrative_level = 3 AND sgg_cd = %s
          AND eup_myeon_dong_name IS NOT NULL
        ORDER BY eup_myeon_dong_name
        """,
        (sgg_cd,),
    )


@app.get("/api/apartment-trades")
def list_apartment_trades(
    sgg_cd: str = Query(pattern=r"^\d{5}$"),
    umd_nm: str | None = None,
    area_ranges: list[str] | None = Query(
        default=None,
        description="반복 가능한 '하한-상한' 목록. 상한은 미포함이며, 열린 상한은 '115-'처럼 보낸다.",
    ),
    start_year: int | None = Query(default=None, ge=1900, le=2100),
    end_year: int | None = Query(default=None, ge=1900, le=2100),
    months: list[int] | None = Query(default=None),
):
    if start_year is not None and end_year is not None and start_year > end_year:
        raise HTTPException(status_code=422, detail="start_year는 end_year보다 클 수 없습니다.")
    if months and any(month < 1 or month > 12 for month in months):
        raise HTTPException(status_code=422, detail="months는 1~12 사이여야 합니다.")

    conditions = ["trade.lawd_cd = %s"]
    parameters: list[object] = [sgg_cd]
    for value, expression in (
        (umd_nm, "trade.dong_name = %s"),
        (start_year, "trade.deal_year >= %s"),
        (end_year, "trade.deal_year <= %s"),
    ):
        if value is not None:
            conditions.append(expression)
            parameters.append(value)
    if area_ranges:
        range_conditions = []
        for area_range in area_ranges:
            try:
                minimum_text, maximum_text = area_range.split("-", maxsplit=1)
                minimum = float(minimum_text)
                maximum = float(maximum_text) if maximum_text else None
            except ValueError as error:
                raise HTTPException(status_code=422, detail="area_ranges 형식이 올바르지 않습니다.") from error
            if maximum is not None and minimum > maximum:
                raise HTTPException(status_code=422, detail="area_ranges의 최소값이 최대값보다 클 수 없습니다.")

            range_conditions.append("trade.area >= %s" + (" AND trade.area < %s" if maximum is not None else ""))
            parameters.append(minimum)
            if maximum is not None:
                parameters.append(maximum)
        conditions.append("(" + " OR ".join(f"({condition})" for condition in range_conditions) + ")")
    if months:
        conditions.append("trade.deal_month = ANY(%s)")
        parameters.append(months)

    return fetch_all(
        f"""
        SELECT trade.apt_nm, MIN(trade.build_year) AS build_year,
               MIN(trade.dong_name) AS umd_nm, COUNT(*) AS transaction_count
        FROM apartment_trade trade
        WHERE {' AND '.join(conditions)}
        GROUP BY trade.apt_nm
        ORDER BY transaction_count DESC, trade.apt_nm
        """,
        tuple(parameters),
    )


@app.get("/test")
def test():
    return fetch_all("SELECT COUNT(*) AS rows FROM apartment_trade")[0]
