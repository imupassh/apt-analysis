import os
import pandas as pd
from psycopg2.extras import execute_values

from db import get_connection

# csv 파일 경로 (나중에 수정 예정/ 현재 서울시만)
DATA_DIR=r"D:\부동산분석\아파트 매매 데이터"




conn = get_connection()
cur = conn.cursor()

total_files=0
total_rows=0




sql = """
INSERT INTO apartment_trade
(
    apt_nm,
    apt_dong,
    build_year,
    deal_amount,
    deal_year,
    deal_month,
    deal_day,
    area,
    floor,
    lawd_cd,
    dong_name,
    jibun,
    cancel_day
)
VALUES %s
"""



#파일 넣음
for filename in os.listdir(DATA_DIR):

    #서울파일만
    if not filename.startswith("apt_11"):
        continue
    #csv만
    if not filename.endswith(".csv"):
        continue

    csv_path = os.path.join(DATA_DIR, filename) #전체경로 저장

    cur.execute(
        "SELECT 1 FROM imported_files WHERE filename = %s",
        (filename,)
    )
    if cur.fetchone():
        print(f"[skip] 이미 존재하는 파일:{filename}")
        continue

    print(f"{filename} 처리중")


    # csv 읽기
    df = pd.read_csv(csv_path)

    # 필요한 컬럼만 선택
    df = df[
        [
            "aptNm",
            "aptDong",
            "buildYear",
            "dealAmount",
            "dealYear",
            "dealMonth",
            "dealDay",
            "excluUseAr",
            "floor",
            "sggCd",
            "umdNm",
            "jibun",
            "cdealDay",
        ]
    ]

    # db 컬럼명으로 변경
    df.columns = [
        "apt_nm",
        "apt_dong", #아파트 동호수의 동
        "build_year",
        "deal_amount",
        "deal_year",
        "deal_month",
        "deal_day",
        "area",
        "floor",
        "lawd_cd",
        "dong_name", #지역명 동
        "jibun",
        "cancel_day",
    ]

    # 거래금액 쉼표제거
    df["deal_amount"] = (
        df["deal_amount"]
        .astype(str) #문자열로 변환
        .str.replace(",","", regex=False) #,없앰
        .astype(int) #다시 숫자로 변경
    )

    #NaN -> None
    df = df.where(pd.notnull(df), None)

    #tuple 형태로 변환
    records = list(df.itertuples(index=False, name=None))

    #db 저장
    execute_values(cur, sql,records)
    cur.execute(
    "INSERT INTO imported_files (filename) VALUES (%s)",
    (filename,)
    )
    conn.commit()

    print(f"{len(records)}건 저장 완료")

    total_files += 1
    total_rows += len(records)

#정리
cur.close()
conn.close()

print()
print("=" * 40)
print(f"총 파일 : {total_files}개")
print(f"총 저장 : {total_rows}건")