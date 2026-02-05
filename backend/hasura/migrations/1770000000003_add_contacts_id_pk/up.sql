-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- If a primary key constraint exists on phone, drop it
ALTER TABLE IF EXISTS public.contacts DROP CONSTRAINT IF EXISTS contacts_pkey;

-- Also drop unique index if present (safety)
DROP INDEX IF EXISTS contacts_pkey;

-- Add id column with UUID default if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'id'
  ) THEN
    EXECUTE 'ALTER TABLE public.contacts ADD COLUMN id uuid DEFAULT gen_random_uuid()';
  END IF;
END
$$;

-- Make id NOT NULL
ALTER TABLE public.contacts ALTER COLUMN id SET NOT NULL;

-- Add primary key on id
ALTER TABLE public.contacts ADD CONSTRAINT contacts_id_pkey PRIMARY KEY (id);

-- Ensure phone has a normal index (non-unique)
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts USING btree (phone);
