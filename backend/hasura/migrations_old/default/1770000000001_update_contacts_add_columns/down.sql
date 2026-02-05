-- Revert column additions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date'
  ) THEN
    EXECUTE 'ALTER TABLE contacts DROP COLUMN "date"';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'email'
  ) THEN
    EXECUTE 'ALTER TABLE contacts DROP COLUMN email';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'contact_id'
  ) THEN
    EXECUTE 'DROP INDEX IF EXISTS idx_contacts_contact_id';
    EXECUTE 'ALTER TABLE contacts DROP COLUMN contact_id';
  END IF;
END
$$;
