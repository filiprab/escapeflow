-- CreateTable
CREATE TABLE "cves" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "data_version" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "assigner_org_id" TEXT NOT NULL,
    "assigner_short_name" TEXT NOT NULL,
    "date_reserved" TIMESTAMP(3) NOT NULL,
    "date_published" TIMESTAMP(3) NOT NULL,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_descriptions" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "cve_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_references" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,

    CONSTRAINT "cve_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_affected_products" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "product" TEXT NOT NULL,

    CONSTRAINT "cve_affected_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_versions" (
    "id" TEXT NOT NULL,
    "affected_product_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "less_than" TEXT,
    "version_type" TEXT NOT NULL,

    CONSTRAINT "cve_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_labels" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "operating_systems" TEXT[],
    "components" TEXT[],

    CONSTRAINT "cve_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_metrics" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "cvss_version" TEXT,
    "base_score" DOUBLE PRECISION,
    "base_severity" TEXT,
    "vector_string" TEXT,
    "attack_vector" TEXT,
    "attack_complexity" TEXT,
    "privileges_required" TEXT,
    "user_interaction" TEXT,
    "scope" TEXT,
    "confidentiality_impact" TEXT,
    "integrity_impact" TEXT,
    "availability_impact" TEXT,
    "metrics_json" JSONB,

    CONSTRAINT "cve_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cve_problem_types" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT,
    "cwe_id" TEXT,

    CONSTRAINT "cve_problem_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "target_components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source_privilege" TEXT NOT NULL,
    "target_privilege" TEXT NOT NULL,
    "source_privilege_info" JSONB NOT NULL,
    "target_privilege_info" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploitation_techniques" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detailed_description" TEXT NOT NULL,
    "pocs" TEXT[],
    "mitigations" TEXT[],
    "references" TEXT[],
    "context_specific_impact" TEXT[],
    "target_component_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exploitation_techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technique_cve_links" (
    "id" TEXT NOT NULL,
    "technique_id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,

    CONSTRAINT "technique_cve_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cves_cve_id_key" ON "cves"("cve_id");

-- CreateIndex
CREATE INDEX "cves_date_published_idx" ON "cves"("date_published");

-- CreateIndex
CREATE INDEX "cves_date_updated_idx" ON "cves"("date_updated");

-- CreateIndex
CREATE INDEX "cves_state_idx" ON "cves"("state");

-- CreateIndex
CREATE UNIQUE INDEX "cve_labels_cve_id_key" ON "cve_labels"("cve_id");

-- CreateIndex
CREATE INDEX "cve_metrics_base_score_idx" ON "cve_metrics"("base_score");

-- CreateIndex
CREATE INDEX "cve_metrics_base_severity_idx" ON "cve_metrics"("base_severity");

-- CreateIndex
CREATE UNIQUE INDEX "technique_cve_links_technique_id_cve_id_key" ON "technique_cve_links"("technique_id", "cve_id");

-- AddForeignKey
ALTER TABLE "cve_descriptions" ADD CONSTRAINT "cve_descriptions_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_references" ADD CONSTRAINT "cve_references_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_affected_products" ADD CONSTRAINT "cve_affected_products_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_versions" ADD CONSTRAINT "cve_versions_affected_product_id_fkey" FOREIGN KEY ("affected_product_id") REFERENCES "cve_affected_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_labels" ADD CONSTRAINT "cve_labels_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_metrics" ADD CONSTRAINT "cve_metrics_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cve_problem_types" ADD CONSTRAINT "cve_problem_types_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploitation_techniques" ADD CONSTRAINT "exploitation_techniques_target_component_id_fkey" FOREIGN KEY ("target_component_id") REFERENCES "target_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technique_cve_links" ADD CONSTRAINT "technique_cve_links_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "exploitation_techniques"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technique_cve_links" ADD CONSTRAINT "technique_cve_links_cve_id_fkey" FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id") ON DELETE CASCADE ON UPDATE CASCADE;
