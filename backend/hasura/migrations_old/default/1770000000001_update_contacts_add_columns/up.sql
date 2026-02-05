-- Add email, date, and contact_id to contacts safely

-- Ensure pgcrypto exists for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add email column if missing
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email text;

-- Add contact_id column (uuid), populate existing rows, set default and not null, add unique index
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_id uuid;
UPDATE contacts SET contact_id = gen_random_uuid() WHERE contact_id IS NULL;
ALTER TABLE contacts ALTER COLUMN contact_id SET DEFAULT gen_random_uuid();
ALTER TABLE contacts ALTER COLUMN contact_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_contact_id ON contacts (contact_id);

-- Add date column if missing (timestamptz) with default now()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE contacts ADD COLUMN "date" timestamptz DEFAULT now()';
  END IF;
END
$$;
