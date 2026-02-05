-- Revert contacts.date to date and remove default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE contacts ALTER COLUMN "date" TYPE date USING "date"::date';
    EXECUTE 'ALTER TABLE contacts ALTER COLUMN "date" DROP DEFAULT';
  END IF;
END
$$;

-- Drop foreign key if it exists
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_crt_id_fkey;

-- Drop indexes created by the migration
DROP INDEX IF EXISTS idx_contacts_crt_id;
DROP INDEX IF EXISTS idx_myUsers_username_unique;

-- Remove default on myUsers.id
ALTER TABLE "myUsers" ALTER COLUMN id DROP DEFAULT;

-- Note: the pgcrypto extension is left in place intentionally.
