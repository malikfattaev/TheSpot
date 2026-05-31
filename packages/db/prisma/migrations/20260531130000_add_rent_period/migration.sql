-- CreateEnum
CREATE TYPE "public"."RentPeriod" AS ENUM ('MONTHLY', 'DAILY');

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN "rentPeriod" "public"."RentPeriod" NOT NULL DEFAULT 'MONTHLY';
