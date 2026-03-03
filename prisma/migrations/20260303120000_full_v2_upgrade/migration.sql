-- 1. Create Factory table
CREATE TABLE "factories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");
CREATE UNIQUE INDEX "factories_slug_key" ON "factories"("slug");

-- 2. Insert default factory
INSERT INTO "factories" ("name", "code", "slug", "address", "phone", "gstin")
VALUES ('Captain Offset Press', 'CAPTOFF', 'captain-offset', 'B-18, Sector-58, Noida, UP', '', '');

-- 3. Add new columns to people (nullable first)
ALTER TABLE "people" ADD COLUMN "pin" TEXT NOT NULL DEFAULT '1234';
ALTER TABLE "people" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "people" ADD COLUMN "factory_id" INTEGER;

-- Backfill people factory_id
UPDATE "people" SET "factory_id" = 1;

-- Make NOT NULL
ALTER TABLE "people" ALTER COLUMN "factory_id" SET NOT NULL;

-- 4. Add new columns to customers
ALTER TABLE "customers" ADD COLUMN "gstin" TEXT NOT NULL DEFAULT '';
ALTER TABLE "customers" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "customers" ADD COLUMN "factory_id" INTEGER;

-- Backfill customers factory_id
UPDATE "customers" SET "factory_id" = 1;

-- Make NOT NULL
ALTER TABLE "customers" ALTER COLUMN "factory_id" SET NOT NULL;

-- 5. Add new columns to jobs
ALTER TABLE "jobs" ADD COLUMN "factory_id" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE "jobs" ADD COLUMN "gsm" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "size_width" DOUBLE PRECISION;
ALTER TABLE "jobs" ADD COLUMN "size_height" DOUBLE PRECISION;
ALTER TABLE "jobs" ADD COLUMN "size_unit" TEXT NOT NULL DEFAULT 'inch';
ALTER TABLE "jobs" ADD COLUMN "num_colors" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "print_sides" TEXT NOT NULL DEFAULT 'single';
ALTER TABLE "jobs" ADD COLUMN "finish_type" TEXT;
ALTER TABLE "jobs" ADD COLUMN "box_layers" INTEGER;
ALTER TABLE "jobs" ADD COLUMN "box_board_type" TEXT;
ALTER TABLE "jobs" ADD COLUMN "flute_type" TEXT;
ALTER TABLE "jobs" ADD COLUMN "estimated_cost" DOUBLE PRECISION;
ALTER TABLE "jobs" ADD COLUMN "quoted_rate" DOUBLE PRECISION;
ALTER TABLE "jobs" ADD COLUMN "quotation_id" INTEGER;

-- Backfill jobs factory_id
UPDATE "jobs" SET "factory_id" = 1;

-- Make NOT NULL
ALTER TABLE "jobs" ALTER COLUMN "factory_id" SET NOT NULL;

-- 6. Add new columns to materials
ALTER TABLE "materials" ADD COLUMN "current_stock" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "materials" ADD COLUMN "factory_id" INTEGER;

-- Backfill materials factory_id
UPDATE "materials" SET "factory_id" = 1;

-- Make NOT NULL
ALTER TABLE "materials" ALTER COLUMN "factory_id" SET NOT NULL;

-- 7. Modify stock_ledger: add new columns, then drop old
ALTER TABLE "stock_ledger" ADD COLUMN "balance_after" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "stock_ledger" ADD COLUMN "logged_by_id" INTEGER;

-- Map old logged_by (string name) to person IDs
UPDATE "stock_ledger" sl SET "logged_by_id" = p.id
FROM "people" p WHERE p.name = sl.logged_by;

-- Drop old logged_by column
ALTER TABLE "stock_ledger" DROP COLUMN "logged_by";

-- 8. Modify production_stages: add new FK columns, drop old string
ALTER TABLE "production_stages" ADD COLUMN "completed_by_id" INTEGER;
ALTER TABLE "production_stages" ADD COLUMN "started_by_id" INTEGER;

-- Map old completed_by (string name) to person IDs
UPDATE "production_stages" ps SET "completed_by_id" = p.id
FROM "people" p WHERE p.name = ps.completed_by;

-- Drop old completed_by column
ALTER TABLE "production_stages" DROP COLUMN "completed_by";

-- 9. Modify dispatches: add new columns
ALTER TABLE "dispatches" ADD COLUMN "factory_id" INTEGER;
ALTER TABLE "dispatches" ADD COLUMN "challan_no" TEXT NOT NULL DEFAULT '';
ALTER TABLE "dispatches" ADD COLUMN "dispatched_by_id" INTEGER;

-- Backfill dispatches factory_id
UPDATE "dispatches" SET "factory_id" = 1;

-- Make NOT NULL
ALTER TABLE "dispatches" ALTER COLUMN "factory_id" SET NOT NULL;

-- Generate challan numbers for existing dispatches
UPDATE "dispatches" SET "challan_no" = 'DC-2026-' || LPAD(CAST(id AS TEXT), 4, '0');

-- 10. Create new tables

-- GateLog
CREATE TABLE "gate_logs" (
    "id" SERIAL NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "entry_type" TEXT NOT NULL,
    "person_name" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "material" TEXT NOT NULL DEFAULT '',
    "quantity" TEXT NOT NULL DEFAULT '',
    "entry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMP(3),
    "logged_by_id" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "gate_logs_pkey" PRIMARY KEY ("id")
);

-- JobMaterial
CREATE TABLE "job_materials" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "estimated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "job_materials_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_materials_job_id_material_id_key" ON "job_materials"("job_id", "material_id");

-- Quotation
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "quotation_no" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "items" TEXT NOT NULL DEFAULT '[]',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "valid_until" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "quotations_quotation_no_key" ON "quotations"("quotation_no");

-- Invoice
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "quotation_id" INTEGER,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "due_date" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoice_no_key" ON "invoices"("invoice_no");

-- Payment
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'cash',
    "reference" TEXT NOT NULL DEFAULT '',
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- ActivityLog
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "factory_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT '',
    "old_value" TEXT NOT NULL DEFAULT '',
    "new_value" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- 11. Compute currentStock from ledger entries
UPDATE "materials" m SET "current_stock" = COALESCE((
    SELECT SUM(
        CASE WHEN sl.entry_type = 'inward' THEN sl.quantity
             WHEN sl.entry_type = 'adjustment' THEN sl.quantity
             ELSE -sl.quantity
        END
    )
    FROM "stock_ledger" sl WHERE sl.material_id = m.id
), 0);

-- 12. Add all foreign keys

-- People -> Factory
ALTER TABLE "people" ADD CONSTRAINT "people_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Customers -> Factory
ALTER TABLE "customers" ADD CONSTRAINT "customers_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Jobs -> Factory
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Materials -> Factory
ALTER TABLE "materials" ADD CONSTRAINT "materials_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- StockLedger -> Person
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_logged_by_id_fkey" FOREIGN KEY ("logged_by_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ProductionStages -> Person
ALTER TABLE "production_stages" ADD CONSTRAINT "production_stages_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "production_stages" ADD CONSTRAINT "production_stages_started_by_id_fkey" FOREIGN KEY ("started_by_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Dispatches -> Factory, Person
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_dispatched_by_id_fkey" FOREIGN KEY ("dispatched_by_id") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- GateLog FKs
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gate_logs" ADD CONSTRAINT "gate_logs_logged_by_id_fkey" FOREIGN KEY ("logged_by_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- JobMaterial FKs
ALTER TABLE "job_materials" ADD CONSTRAINT "job_materials_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_materials" ADD CONSTRAINT "job_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Quotation FKs
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoice FKs
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Payment FKs
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ActivityLog FKs
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_factory_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
