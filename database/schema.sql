CREATE TABLE IF NOT EXISTS cats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    salary NUMERIC(10,2) NOT NULL CHECK (salary >= 0),
    birth_date DATE NOT NULL,
    remote_worker BOOLEAN NOT NULL DEFAULT FALSE,
    lives_remaining INTEGER NOT NULL CHECK (lives_remaining BETWEEN 0 AND 9),
    photo_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_of_day (
    id SERIAL PRIMARY KEY,
    cat_id INTEGER NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
    selected_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cats_active ON cats(active);
