-- Enable UUID generation (pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure `myUsers.id` has a UUID default
ALTER TABLE "myUsers" ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure username is unique (unique index is safe in migrations)
CREATE UNIQUE INDEX IF NOT EXISTS idx_myUsers_username_unique ON "myUsers" (username);

-- Ensure `contacts.crt_id` is UUID-typed (no-op if already uuid)
ALTER TABLE contacts
  ALTER COLUMN crt_id TYPE uuid USING crt_id::uuid;

-- Add FK from contacts.crt_id -> myUsers.id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contacts_crt_id_fkey'
  ) THEN
    EXECUTE 'ALTER TABLE contacts ADD CONSTRAINT contacts_crt_id_fkey FOREIGN KEY (crt_id) REFERENCES "myUsers"(id) ON DELETE CASCADE';
  END IF;
END
$$;

-- Index for faster lookups by creator
CREATE INDEX IF NOT EXISTS idx_contacts_crt_id ON contacts (crt_id);

-- Convert `contacts.date` to timestamptz and set default to now()
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE contacts ALTER COLUMN "date" TYPE timestamptz USING "date"::timestamptz';
    EXECUTE 'ALTER TABLE contacts ALTER COLUMN "date" SET DEFAULT now()';
  END IF;
END
$$;
