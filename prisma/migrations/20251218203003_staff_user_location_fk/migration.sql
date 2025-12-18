/*
  Warnings:

  - You are about to drop the column `office_id` on the `staff_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app"."staff_user" DROP COLUMN "office_id",
ADD COLUMN     "location_id" TEXT;

-- AddForeignKey
ALTER TABLE "app"."staff_user" ADD CONSTRAINT "staff_user_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "app"."location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
