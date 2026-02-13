-- Evita descontar stock más de una vez cuando la orden pasa a paid
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_decremented boolean NOT NULL DEFAULT false;
