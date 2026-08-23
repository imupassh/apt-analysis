import csv
from pathlib import Path

from psycopg2.extras import execute_values

from db import get_connection


PROJECT_DIR = Path(__file__).resolve().parent.parent
SOURCE_PATH = PROJECT_DIR / "crawler" / "법정동코드 전체자료.txt"


def level_for(code: str) -> int:
    if code.endswith("00000000"):
        return 1
    if code.endswith("00000"):
        return 2
    return 3


def name_after_prefix(full_name: str, prefix: str) -> str | None:
    if full_name == prefix:
        return None
    if full_name.startswith(f"{prefix} "):
        return full_name[len(prefix) + 1 :]
    return full_name.rsplit(" ", 1)[-1]


def read_regions(path: Path) -> list[tuple]:
    with path.open("r", encoding="cp949", newline="") as source:
        rows = list(csv.DictReader(source, delimiter="\t"))

    full_names = {row["법정동코드"].strip(): row["법정동명"].strip() for row in rows}
    records = []
    for row in rows:
        code = row["법정동코드"].strip()
        full_name = row["법정동명"].strip()
        level = level_for(code)
        sido_name = full_names.get(f"{code[:2]}00000000", full_name.split(" ", 1)[0])
        sigungu_code = f"{code[:5]}00000"
        sigungu_full_name = full_names.get(sigungu_code)

        sigungu_name = None
        eup_myeon_dong_name = None
        sgg_cd = None
        if level >= 2:
            sgg_cd = code[:5]
            sigungu_name = name_after_prefix(sigungu_full_name or full_name, sido_name)
        if level == 3:
            eup_myeon_dong_name = name_after_prefix(full_name, sigungu_full_name or sido_name)

        records.append(
            (
                code,
                full_name,
                sido_name,
                sigungu_name,
                eup_myeon_dong_name,
                sgg_cd,
                level,
                row["폐지여부"].strip() == "존재",
                row["폐지여부"].strip(),
            )
        )
    return records


UPSERT_SQL = """
INSERT INTO region (
    legal_dong_code, full_name, sido_name, sigungu_name, eup_myeon_dong_name,
    sgg_cd, administrative_level, is_active, source_status
) VALUES %s
ON CONFLICT (legal_dong_code) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    sido_name = EXCLUDED.sido_name,
    sigungu_name = EXCLUDED.sigungu_name,
    eup_myeon_dong_name = EXCLUDED.eup_myeon_dong_name,
    sgg_cd = EXCLUDED.sgg_cd,
    administrative_level = EXCLUDED.administrative_level,
    is_active = EXCLUDED.is_active,
    source_status = EXCLUDED.source_status
"""


def verify(cursor) -> None:
    checks = {
        "서울특별시": "SELECT EXISTS (SELECT 1 FROM region WHERE is_active AND administrative_level = 1 AND sido_name = %s)",
        "강남구": "SELECT EXISTS (SELECT 1 FROM region WHERE is_active AND sido_name = %s AND sigungu_name = %s)",
        "대치동": "SELECT EXISTS (SELECT 1 FROM region WHERE is_active AND sgg_cd = %s AND eup_myeon_dong_name = %s)",
    }
    parameters = {
        "서울특별시": ("서울특별시",),
        "강남구": ("서울특별시", "강남구"),
        "대치동": ("11680", "대치동"),
    }
    for label, query in checks.items():
        cursor.execute(query, parameters[label])
        print(f"{label}: {cursor.fetchone()[0]}")

    cursor.execute(
        "SELECT sgg_cd FROM region WHERE is_active AND sido_name = %s AND sigungu_name = %s LIMIT 1",
        ("서울특별시", "강남구"),
    )
    print(f"강남구 sgg_cd: {cursor.fetchone()[0]}")
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM apartment_trade trade
        JOIN region region
          ON region.sgg_cd = trade.lawd_cd
         AND region.eup_myeon_dong_name = trade.dong_name
         AND region.is_active
        WHERE region.sido_name = %s
          AND region.sigungu_name = %s
          AND region.eup_myeon_dong_name = %s
        """,
        ("서울특별시", "강남구", "대치동"),
    )
    print(f"서울특별시 | 강남구 | 대치동 | 거래 데이터: {cursor.fetchone()[0]}건")


def main() -> None:
    if not SOURCE_PATH.exists():
        raise FileNotFoundError(f"법정동코드 파일이 없습니다: {SOURCE_PATH}")

    records = read_regions(SOURCE_PATH)
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            execute_values(cursor, UPSERT_SQL, records, page_size=1000)
            verify(cursor)
        connection.commit()
        print(f"region 적재 완료: {len(records):,}건")
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    main()
