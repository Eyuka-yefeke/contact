-- Rollback: remove non-unique index and recreate the unique index (may fail if duplicates exist)
DROP INDEX IF EXISTS idx_contacts_crt_id;

-- Restore previous unique index (will error if duplicate crt_id values exist)
CREATE UNIQUE INDEX IF NOT EXISTS contacts_crt_id_key ON public.contacts USING btree (crt_id);
