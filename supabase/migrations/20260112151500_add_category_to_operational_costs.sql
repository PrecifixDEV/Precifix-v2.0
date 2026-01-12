-- Add category column to operational_costs
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS category TEXT;
