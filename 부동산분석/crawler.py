import os
import time
import requests
import pandas as pd
import xml.etree.ElementTree as ET
import math

from pathlib import Path
from datetime import datetime

SERVICE_KEY="발급받은 서비스 키 입력"
URL="https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade"
SAVE_DIR="D:/부동산분석"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SAVE_DIR = os.path.join(BASE_DIR, "아파트 매매 데이터")
os.makedirs(SAVE_DIR, exist_ok=True)

CODE_FILE = os.path.join(BASE_DIR, "법정동코드 전체자료.txt")


# 다운로드 기간

CURRENT_MONTH = time.strftime("%Y%m")

months = [
    f"{y}{str(m).zfill(2)}"
    for y in range(2007, int(CURRENT_MONTH[:4]) + 1)
    for m in range(1, 13)
]

months = [m for m in months if m <= CURRENT_MONTH]


# 법정동코드

df = pd.read_csv(
    CODE_FILE,
    encoding="cp949",
    sep="\t",
    dtype=str
)

df = df[df["폐지여부"] == "존재"]

df = df[df["법정동명"].str.split().str.len() >= 2]

df["sigungu_code"] = df["법정동코드"].str[:5]

sigungu_list = sorted(df["sigungu_code"].drop_duplicates().tolist())

print(f"시군구 개수 : {len(sigungu_list)}")


# 다운로드

for code in sigungu_list:

    print(f"\n===== {code} 시작 =====")

    for month in months:

        filename = f"apt_{code}_{month}.csv"
        filepath = os.path.join(SAVE_DIR, filename)

        # 이미 있으면 건너뛰기
        if os.path.exists(filepath):
            print(f"[SKIP] {filename}")
            continue

        all_rows = []

        retry = 0

        while retry < 5:

            try:


                # 첫 페이지
                params = {
                    "serviceKey": SERVICE_KEY,
                    "LAWD_CD": code,
                    "DEAL_YMD": month,
                    "pageNo": 1,
                    "numOfRows": 1000
                }

                response = requests.get(
                    URL,
                    params=params,
                    timeout=20
                )

                response.raise_for_status()

                root = ET.fromstring(response.text)

                total = root.findtext(".//totalCount")

                if total is None:
                    total = 0

                total = int(total)

                if total == 0:
                    print(f"[없음] {code}-{month}")
                    break

                total_pages = math.ceil(total / 1000)

                # 모든 페이지

                for page in range(1, total_pages + 1):

                    params["pageNo"] = page

                    r = requests.get(
                        URL,
                        params=params,
                        timeout=20
                    )

                    r.raise_for_status()

                    root = ET.fromstring(r.text)

                    items = root.findall(".//item")

                    for item in items:

                        row = {}

                        for child in item:

                            row[child.tag] = child.text.strip() if child.text else ""

                        all_rows.append(row)

                    time.sleep(0.2)

                # 저장

                df_result = pd.DataFrame(all_rows)

                df_result.to_csv(
                    filepath,
                    index=False,
                    encoding="utf-8-sig"
                )

                print(
                    f"[완료] {code}-{month} "
                    f"{len(df_result)}건"
                )

                break

            except Exception as e:

                retry += 1

                print(
                    f"[재시도 {retry}/5] "
                    f"{code}-{month}"
                )

                print(e)

                time.sleep(2)

        else:

            print(f"[실패] {code}-{month}")

print("\n========== 완료 ==========")