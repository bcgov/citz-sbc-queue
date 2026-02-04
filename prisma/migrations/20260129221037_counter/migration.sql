-- AlterTable
ALTER TABLE "app"."staff_user" ALTER COLUMN "counter_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "app"."counter" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."location_counter" (
    "id" TEXT NOT NULL,
    "location_id" TEXT,
    "counter_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "location_counter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "app"."location_counter" ADD CONSTRAINT "location_counter_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "app"."location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."location_counter" ADD CONSTRAINT "location_counter_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "app"."counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."staff_user" ADD CONSTRAINT "staff_user_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "app"."counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
