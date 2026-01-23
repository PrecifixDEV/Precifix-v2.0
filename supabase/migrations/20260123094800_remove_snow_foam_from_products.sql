-- Remove Snow Foam columns from products table
ALTER TABLE products DROP COLUMN IF EXISTS uses_snow_foam;
ALTER TABLE products DROP COLUMN IF EXISTS snow_foam_dilution;
