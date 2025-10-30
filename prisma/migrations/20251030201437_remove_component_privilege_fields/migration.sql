/*
  Warnings:

  - You are about to drop the column `source_privilege_id` on the `target_components` table. All the data in the column will be lost.
  - You are about to drop the column `target_privilege_id` on the `target_components` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."target_components" DROP CONSTRAINT "target_components_source_privilege_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."target_components" DROP CONSTRAINT "target_components_target_privilege_id_fkey";

-- DropIndex
DROP INDEX "public"."target_components_source_privilege_id_idx";

-- DropIndex
DROP INDEX "public"."target_components_target_privilege_id_idx";

-- AlterTable
ALTER TABLE "public"."target_components" DROP COLUMN "source_privilege_id",
DROP COLUMN "target_privilege_id";
