CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "public"."myUsers" add column "id" uuid
 not null unique default gen_random_uuid();
