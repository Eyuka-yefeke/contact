BEGIN TRANSACTION;
ALTER TABLE "public"."contacts" DROP CONSTRAINT "contacts_pkey";

ALTER TABLE "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;
