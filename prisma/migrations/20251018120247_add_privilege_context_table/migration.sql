/*
  Migration: Add PrivilegeContext table and migrate existing data

  This migration:
  1. Creates the new privilege_contexts table
  2. Seeds it with standard privilege levels
  3. Adds new foreign key columns to target_components
  4. Migrates existing data to use the new structure
  5. Drops the old JSON columns
*/

-- Step 1: Create the privilege_contexts table first (before altering target_components)

CREATE TABLE "public"."privilege_contexts" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "capabilities" TEXT[],
    "restrictions" TEXT[],
    "examples" TEXT[],
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privilege_contexts_pkey" PRIMARY KEY ("id")
);

-- Create indexes on privilege_contexts
CREATE UNIQUE INDEX "privilege_contexts_level_key" ON "public"."privilege_contexts"("level");
CREATE INDEX "privilege_contexts_order_idx" ON "public"."privilege_contexts"("order");

-- Step 2: Initial privilege contexts will be seeded via prisma/seed.ts
-- The migration assumes privilege contexts exist or will be created
-- Run: npm run seed to populate the privilege_contexts table

-- Step 3: Add new foreign key columns to target_components (nullable for now)
ALTER TABLE "public"."target_components"
ADD COLUMN "source_privilege_id" TEXT,
ADD COLUMN "target_privilege_id" TEXT;

-- Step 4: Migrate existing data - map old privilege strings to new privilege context IDs
UPDATE "public"."target_components" SET
  "source_privilege_id" = CASE "source_privilege"
    WHEN 'V8 Heap Sandbox' THEN 'priv_v8_heap_sandbox'
    WHEN 'Renderer Process' THEN 'priv_renderer_process'
    WHEN 'GPU Process' THEN 'priv_gpu_process'
    WHEN 'Browser Process' THEN 'priv_browser_process'
    WHEN 'System/Root' THEN 'priv_system_root'
    ELSE NULL
  END,
  "target_privilege_id" = CASE "target_privilege"
    WHEN 'V8 Heap Sandbox' THEN 'priv_v8_heap_sandbox'
    WHEN 'Renderer Process' THEN 'priv_renderer_process'
    WHEN 'GPU Process' THEN 'priv_gpu_process'
    WHEN 'Browser Process' THEN 'priv_browser_process'
    WHEN 'System/Root' THEN 'priv_system_root'
    ELSE NULL
  END;

-- Step 5: Make the foreign key columns NOT NULL (all data should be migrated by now)
ALTER TABLE "public"."target_components"
ALTER COLUMN "source_privilege_id" SET NOT NULL,
ALTER COLUMN "target_privilege_id" SET NOT NULL;

-- Step 6: Create indexes on the new foreign key columns
CREATE INDEX "target_components_source_privilege_id_idx" ON "public"."target_components"("source_privilege_id");
CREATE INDEX "target_components_target_privilege_id_idx" ON "public"."target_components"("target_privilege_id");

-- Step 7: Add foreign key constraints
ALTER TABLE "public"."target_components"
ADD CONSTRAINT "target_components_source_privilege_id_fkey"
FOREIGN KEY ("source_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."target_components"
ADD CONSTRAINT "target_components_target_privilege_id_fkey"
FOREIGN KEY ("target_privilege_id") REFERENCES "public"."privilege_contexts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 8: Drop the old columns (no longer needed)
ALTER TABLE "public"."target_components"
DROP COLUMN "source_privilege",
DROP COLUMN "source_privilege_info",
DROP COLUMN "target_privilege",
DROP COLUMN "target_privilege_info";
