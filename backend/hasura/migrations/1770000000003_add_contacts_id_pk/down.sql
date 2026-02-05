-- Rollback: remove id primary key and column, restore phone primary key
ALTER TABLE IF EXISTS public.contacts DROP CONSTRAINT IF EXISTS contacts_id_pkey;

DROP INDEX IF EXISTS idx_contacts_phone;

-- Drop id column if exists
ALTER TABLE IF EXISTS public.contacts DROP COLUMN IF EXISTS id;

-- Restore phone primary key (will fail if duplicates exist)
ALTER TABLE IF EXISTS public.contacts ADD CONSTRAINT contacts_pkey PRIMARY KEY (phone);
