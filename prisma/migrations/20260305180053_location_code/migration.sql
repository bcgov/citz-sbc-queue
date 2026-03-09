/*
  Warnings:

  - The primary key for the `location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `counter_id` on the `staff_user` table. All the data in the column will be lost.
  - You are about to drop the column `location_id` on the `staff_user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "app"."_CounterToLocation" DROP CONSTRAINT "_CounterToLocation_B_fkey";

-- DropForeignKey
ALTER TABLE "app"."_LocationToService" DROP CONSTRAINT "_LocationToService_A_fkey";

-- DropForeignKey
ALTER TABLE "app"."staff_user" DROP CONSTRAINT "staff_user_counter_id_fkey";

-- DropForeignKey
ALTER TABLE "app"."staff_user" DROP CONSTRAINT "staff_user_location_id_fkey";

-- AlterTable
ALTER TABLE "app"."location" DROP CONSTRAINT "location_pkey",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD CONSTRAINT "location_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "app"."staff_user" DROP COLUMN "counter_id",
DROP COLUMN "location_id",
ADD COLUMN     "counterId" TEXT,
ADD COLUMN     "locationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "location_code_key" ON "app"."location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "service_code_key" ON "app"."service"("code");

-- AddForeignKey
ALTER TABLE "app"."staff_user" ADD CONSTRAINT "staff_user_locationCode_fkey" FOREIGN KEY ("locationCode") REFERENCES "app"."location"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."staff_user" ADD CONSTRAINT "staff_user_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "app"."counter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_CounterToLocation" ADD CONSTRAINT "_CounterToLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "app"."location"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_LocationToService" ADD CONSTRAINT "_LocationToService_A_fkey" FOREIGN KEY ("A") REFERENCES "app"."location"("code") ON DELETE CASCADE ON UPDATE CASCADE;
