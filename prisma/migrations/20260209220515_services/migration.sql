/*
  Warnings:

  - Made the column `location_id` on table `location_counter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `counter_id` on table `location_counter` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "app"."location_counter" DROP CONSTRAINT "location_counter_counter_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."location_counter" DROP CONSTRAINT "location_counter_location_id_fkey";

-- AlterTable
ALTER TABLE "app"."location_counter" ALTER COLUMN "location_id" SET NOT NULL,
ALTER COLUMN "counter_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "app"."location_service" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "service_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "location_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."service" (
    "code" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "public_name" VARCHAR(500) NOT NULL,
    "ticket_prefix" VARCHAR(10) NOT NULL,
    "legacy_service_id" INTEGER,
    "back_office" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "app"."location_counter" ADD CONSTRAINT "location_counter_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "app"."location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."location_counter" ADD CONSTRAINT "location_counter_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "app"."counter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."location_service" ADD CONSTRAINT "location_service_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "app"."location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."location_service" ADD CONSTRAINT "location_service_service_code_fkey" FOREIGN KEY ("service_code") REFERENCES "app"."service"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
