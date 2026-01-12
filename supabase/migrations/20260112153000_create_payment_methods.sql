-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default payment methods
INSERT INTO payment_methods (name) VALUES 
('Dinheiro'),
('PIX'),
('Cartão de Crédito'),
('Cartão de Débito'),
('Boleto')
ON CONFLICT (name) DO NOTHING;
