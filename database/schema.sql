CREATE TABLE apartment_trade (
	id BIGSERIAL PRIMARY KEY,
	-- 아파트 정보
	apt_nm TEXT NOT NULL,
	apt_dong TEXT,
	build_year INTEGER,
	-- 거래 정보
	deal_amount BIGINT NOT NULL,
	deal_year SMALLINT NOT NULL,
	deal_month SMALLINT NOT NULL,
	deal_day SMALLINT,
	-- 면적 및 층
	area NUMERIC(6,2), --면적 9999,99까지 저장 가능
	floor SMALLINT,
	-- 위치
	lawd_cd CHAR(5) NOT NULL, --법정동코드 5자리
	dong_name TEXT NOT NULL,
	jibun TEXT,
	-- 거래 취소 여부
	cancel_day TEXT,
	created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE imported_files(
	filename TEXT PRIMARY KEY,
	imported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS region (
    legal_dong_code CHAR(10) PRIMARY KEY,
    full_name TEXT NOT NULL,
    sido_name TEXT NOT NULL,
    sigungu_name TEXT,
    eup_myeon_dong_name TEXT,
    sgg_cd CHAR(5),
    administrative_level SMALLINT NOT NULL CHECK (administrative_level IN (1, 2, 3)),
    is_active BOOLEAN NOT NULL,
    source_status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_region_active_hierarchy
    ON region (sido_name, sigungu_name, eup_myeon_dong_name)
    WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_region_active_sgg_dong
    ON region (sgg_cd, eup_myeon_dong_name)
    WHERE is_active;
