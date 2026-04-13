-- AlterTable
ALTER TABLE "app"."location" ALTER COLUMN "street_address" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
