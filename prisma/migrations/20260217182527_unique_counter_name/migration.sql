/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `counter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "counter_name_key" ON "app"."counter"("name");
