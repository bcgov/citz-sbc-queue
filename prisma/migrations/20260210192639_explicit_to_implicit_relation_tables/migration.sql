/*
  Warnings:

  - You are about to drop the `location_counter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `location_service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "app"."location_counter" DROP CONSTRAINT "location_counter_counter_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."location_counter" DROP CONSTRAINT "location_counter_location_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."location_service" DROP CONSTRAINT "location_service_location_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."location_service" DROP CONSTRAINT "location_service_service_code_fkey";

-- DropTable
DROP TABLE "app"."location_counter";

-- DropTable
DROP TABLE "app"."location_service";

-- CreateTable
CREATE TABLE "app"."_CounterToLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CounterToLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "app"."_LocationToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LocationToService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CounterToLocation_B_index" ON "app"."_CounterToLocation"("B");

-- CreateIndex
CREATE INDEX "_LocationToService_B_index" ON "app"."_LocationToService"("B");

-- AddForeignKey
ALTER TABLE "app"."_CounterToLocation" ADD CONSTRAINT "_CounterToLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "app"."counter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_CounterToLocation" ADD CONSTRAINT "_CounterToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "app"."location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_LocationToService" ADD CONSTRAINT "_LocationToService_A_fkey" FOREIGN KEY ("A") REFERENCES "app"."location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_LocationToService" ADD CONSTRAINT "_LocationToService_B_fkey" FOREIGN KEY ("B") REFERENCES "app"."service"("code") ON DELETE CASCADE ON UPDATE CASCADE;
