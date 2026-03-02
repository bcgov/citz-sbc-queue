-- CreateTable
CREATE TABLE "app"."service_category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "service_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."_ServiceToServiceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToServiceCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceToServiceCategory_B_index" ON "app"."_ServiceToServiceCategory"("B");

-- AddForeignKey
ALTER TABLE "app"."_ServiceToServiceCategory" ADD CONSTRAINT "_ServiceToServiceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "app"."service"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."_ServiceToServiceCategory" ADD CONSTRAINT "_ServiceToServiceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "app"."service_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
