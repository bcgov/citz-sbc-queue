-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateEnum
CREATE TYPE "app"."Role" AS ENUM ('CSR', 'SCSR', 'SDM', 'Administrator');

-- CreateTable
CREATE TABLE "app"."staff_user" (
    "guid" TEXT NOT NULL,
    "sub" VARCHAR(150) NOT NULL,
    "csr_id" INTEGER,
    "username" VARCHAR(150) NOT NULL,
    "display_name" VARCHAR(250) NOT NULL,
    "office_id" INTEGER NOT NULL,
    "counter_id" INTEGER,
    "role" "app"."Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "is_receptionist" BOOLEAN NOT NULL DEFAULT false,
    "is_office_manager" BOOLEAN NOT NULL DEFAULT false,
    "is_pesticide_designate" BOOLEAN NOT NULL DEFAULT false,
    "is_finance_designate" BOOLEAN NOT NULL DEFAULT false,
    "is_ita2_designate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "staff_user_pkey" PRIMARY KEY ("guid")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_sub_key" ON "app"."staff_user"("sub");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_csr_id_key" ON "app"."staff_user"("csr_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_username_key" ON "app"."staff_user"("username");
