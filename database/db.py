#데이터 적재 스크립트
import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

load_dotenv(PROJECT_DIR / ".env")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}

def get_connection():
    """postgreSQL 연결 객체 반환"""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

if __name__ == "__main__":
    try:
        conn = get_connection()
        print ("db 연결 성공")

        conn.close()
        print ("db 연결 종료")

    except Exception as e:
        print("오류")
        print(e)