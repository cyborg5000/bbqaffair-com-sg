-- Add sequential order number starting from 1001
-- Run this once in Supabase SQL Editor

-- Create sequence
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1001;

-- Add column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number bigint UNIQUE DEFAULT nextval('orders_order_number_seq');

-- Backfill existing orders (oldest -> newest) if needed
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at) AS rn
  FROM orders
  WHERE order_number IS NULL
)
UPDATE orders
SET order_number = 1000 + ranked.rn
FROM ranked
WHERE orders.id = ranked.id;

-- Ensure sequence is ahead of current max
SELECT setval(
  'orders_order_number_seq',
  COALESCE((SELECT MAX(order_number) FROM orders), 1000)
);
