-- AlterTable
ALTER TABLE "public"."privilege_escalations" ADD COLUMN     "visible_in_visualization" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "privilege_escalations_visible_in_visualization_idx" ON "public"."privilege_escalations"("visible_in_visualization");
