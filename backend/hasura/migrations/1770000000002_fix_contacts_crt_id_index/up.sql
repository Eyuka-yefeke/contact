-- Drop accidental UNIQUE index on crt_id so multiple contacts per user are allowed
DROP INDEX IF EXISTS contacts_crt_id_key;

-- Ensure a normal (non-unique) index exists for performance
CREATE INDEX IF NOT EXISTS idx_contacts_crt_id ON public.contacts USING btree (crt_id);
