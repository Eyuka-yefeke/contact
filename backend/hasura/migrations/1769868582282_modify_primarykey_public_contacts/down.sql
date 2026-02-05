alter table "public"."contacts" drop constraint "contacts_pkey";
alter table "public"."contacts"
    add constraint "contacts_pkey"
    primary key ("phone");
