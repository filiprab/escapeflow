-- CreateTable
CREATE TABLE IF NOT EXISTS "cve_proof_of_concepts" (
    "id" TEXT NOT NULL,
    "cve_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" VARCHAR(2048),
    "description" TEXT,
    "author" TEXT,
    "code" TEXT,
    "language" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cve_proof_of_concepts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (only if constraint doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'cve_proof_of_concepts_cve_id_fkey'
    ) THEN
        ALTER TABLE "cve_proof_of_concepts"
        ADD CONSTRAINT "cve_proof_of_concepts_cve_id_fkey"
        FOREIGN KEY ("cve_id") REFERENCES "cves"("cve_id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
