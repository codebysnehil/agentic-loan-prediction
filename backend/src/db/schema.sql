CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT    NOT NULL,
  monthly_income NUMERIC NOT NULL,
  existing_emis  NUMERIC NOT NULL,
  requested_loan NUMERIC NOT NULL,
  tenure_months  INTEGER NOT NULL,
  purpose        TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'PENDING',
  result         JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);
