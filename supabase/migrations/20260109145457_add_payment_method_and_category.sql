ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS category TEXT;
