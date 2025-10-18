-- AlterTable: Change components array to single targetComponent field
-- Drop the old components column and add new targetComponent column

-- Add the new targetComponent column (nullable)
ALTER TABLE "cve_labels" ADD COLUMN "target_component" TEXT;

-- Create index on target_component for faster filtering
CREATE INDEX "cve_labels_target_component_idx" ON "cve_labels"("target_component");

-- Drop the old components column
ALTER TABLE "cve_labels" DROP COLUMN "components";