-- CreateTable
CREATE TABLE "public"."privilege_escalations" (
    "id" TEXT NOT NULL,
    "source_privilege_id" TEXT NOT NULL,
    "target_privilege_id" TEXT NOT NULL,
    "technique_id" TEXT NOT NULL,
    "target_component_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privilege_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "privilege_escalations_source_privilege_id_idx" ON "public"."privilege_escalations"("source_privilege_id");

-- CreateIndex
CREATE INDEX "privilege_escalations_target_privilege_id_idx" ON "public"."privilege_escalations"("target_privilege_id");

-- CreateIndex
CREATE INDEX "privilege_escalations_technique_id_idx" ON "public"."privilege_escalations"("technique_id");

-- CreateIndex
CREATE INDEX "privilege_escalations_target_component_id_idx" ON "public"."privilege_escalations"("target_component_id");

-- AddForeignKey
ALTER TABLE "public"."privilege_escalations" ADD CONSTRAINT "privilege_escalations_source_privilege_id_fkey" FOREIGN KEY ("source_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."privilege_escalations" ADD CONSTRAINT "privilege_escalations_target_privilege_id_fkey" FOREIGN KEY ("target_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."privilege_escalations" ADD CONSTRAINT "privilege_escalations_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "public"."exploitation_techniques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."privilege_escalations" ADD CONSTRAINT "privilege_escalations_target_component_id_fkey" FOREIGN KEY ("target_component_id") REFERENCES "public"."target_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;
