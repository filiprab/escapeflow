/*
  Warnings:

  - You are about to drop the column `pocs` on the `exploitation_techniques` table. All the data in the column will be lost.
  - You are about to drop the column `target_component_id` on the `exploitation_techniques` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."exploitation_techniques" DROP CONSTRAINT "exploitation_techniques_target_component_id_fkey";

-- AlterTable
ALTER TABLE "public"."exploitation_techniques" DROP COLUMN "pocs",
DROP COLUMN "target_component_id";
