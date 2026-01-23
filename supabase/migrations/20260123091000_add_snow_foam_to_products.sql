-- Add Snow Foam columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS uses_snow_foam BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS snow_foam_dilution TEXT;
