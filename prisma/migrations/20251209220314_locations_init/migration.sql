-- CreateTable
CREATE TABLE "app"."locations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL,
    "street_address" VARCHAR(500) NOT NULL,
    "mail_address" VARCHAR(500),
    "phone_number" VARCHAR(20),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "legacy_office_number" INTEGER,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_legacy_office_number_key" ON "app"."locations"("legacy_office_number");
