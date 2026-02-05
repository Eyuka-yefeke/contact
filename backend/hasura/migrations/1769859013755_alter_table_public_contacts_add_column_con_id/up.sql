alter table "public"."contacts" add column "con_id" integer
 not null unique default '0';
