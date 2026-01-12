-- Add recurrence fields to operational_costs if they don't exist
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS recurrence_frequency TEXT; -- 'daily', 'weekly', 'monthly', 'yearly'
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE operational_costs ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;
