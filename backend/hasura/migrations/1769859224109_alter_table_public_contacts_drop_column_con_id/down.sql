alter table "public"."contacts" alter column "con_id" set default 0;
alter table "public"."contacts" add constraint "contacts_con_id_key" unique (con_id);
alter table "public"."contacts" alter column "con_id" drop not null;
alter table "public"."contacts" add column "con_id" int4;
