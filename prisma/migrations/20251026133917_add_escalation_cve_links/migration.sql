-- CreateTable
CREATE TABLE "public"."escalation_cve_links" (
    "id" TEXT NOT NULL,
    "escalation_id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,

    CONSTRAINT "escalation_cve_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "escalation_cve_links_escalation_id_idx" ON "public"."escalation_cve_links"("escalation_id");

-- CreateIndex
CREATE INDEX "escalation_cve_links_cve_id_idx" ON "public"."escalation_cve_links"("cve_id");

-- CreateIndex
CREATE UNIQUE INDEX "escalation_cve_links_escalation_id_cve_id_key" ON "public"."escalation_cve_links"("escalation_id", "cve_id");

-- AddForeignKey
ALTER TABLE "public"."escalation_cve_links" ADD CONSTRAINT "escalation_cve_links_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "public"."cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escalation_cve_links" ADD CONSTRAINT "escalation_cve_links_escalation_id_fkey" FOREIGN KEY ("escalation_id") REFERENCES "public"."privilege_escalations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
