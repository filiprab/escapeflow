-- DropForeignKey
ALTER TABLE "public"."target_components" DROP CONSTRAINT "target_components_source_privilege_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."target_components" DROP CONSTRAINT "target_components_target_privilege_id_fkey";

-- AlterTable
ALTER TABLE "public"."target_components" ALTER COLUMN "source_privilege_id" DROP NOT NULL,
ALTER COLUMN "target_privilege_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."target_components" ADD CONSTRAINT "target_components_source_privilege_id_fkey" FOREIGN KEY ("source_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."target_components" ADD CONSTRAINT "target_components_target_privilege_id_fkey" FOREIGN KEY ("target_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
