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
