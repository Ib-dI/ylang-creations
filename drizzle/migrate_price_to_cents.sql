-- Migration: Convert price columns from Text (Euros) to Integer (Cents)
-- Run this BEFORE running db:push to preserve data

BEGIN;

-- 1. Convert price column
-- Removes currency symbols if any, handles commas/dots, multiplies by 100, casts to int
ALTER TABLE "product" 
ALTER COLUMN "price" TYPE integer 
USING (
  CASE 
    WHEN "price" IS NULL OR "price" = '' THEN 0
    ELSE ("price"::numeric * 100)::integer
  END
);

-- 2. Convert compare_at_price column
ALTER TABLE "product" 
ALTER COLUMN "compare_at_price" TYPE integer 
USING (
  CASE 
    WHEN "compare_at_price" IS NULL OR "compare_at_price" = '' THEN NULL
    ELSE ("compare_at_price"::numeric * 100)::integer
  END
);

COMMIT;
