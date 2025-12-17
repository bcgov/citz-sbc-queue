-- AlterTable
ALTER TABLE "app"."staff_user" ALTER COLUMN "office_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "csr" (
    "csr_id" SERIAL NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "office_id" INTEGER NOT NULL,
    "counter_id" INTEGER,
    "role_id" INTEGER NOT NULL,
    "csr_state_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(6),
    "receptionist_ind" INTEGER NOT NULL,
    "office_manager" INTEGER NOT NULL DEFAULT 0,
    "pesticide_designate" INTEGER NOT NULL DEFAULT 0,
    "finance_designate" INTEGER NOT NULL DEFAULT 0,
    "ita2_designate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "csr_pkey" PRIMARY KEY ("csr_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "csr_username_key" ON "csr"("username");
