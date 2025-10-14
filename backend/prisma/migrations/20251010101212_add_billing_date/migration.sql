-- AlterTable
ALTER TABLE "billing" ADD COLUMN "billing_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set billing_date = created_at
UPDATE "billing" SET "billing_date" = "created_at" WHERE "billing_date" IS NULL;
