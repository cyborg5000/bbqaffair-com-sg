-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert all categories
INSERT INTO categories (name, display_order) VALUES
('Special Set 2026', 1),
('Chef and Service Staff (3 HOUR)', 2),
('BBQ Package', 3),
('Salad', 4),
('Cooked Food (Mains)', 5),
('Cooked Food (Sides)', 6),
('Sides', 7),
('Pork', 8),
('Chicken', 9),
('Lamb', 10),
('Premium Beef', 11),
('Seafood', 12),
('Baby Lobster ( Seafood)', 13),
('Sausage', 14),
('Otah', 15),
('Satay', 16),
('Burger Set', 17),
('Vegetarian', 18),
('Lok Lok', 19),
('Dessert', 20),
('Dessert Tarts', 21),
('Sauces', 22),
('Drinks', 23),
('Dry Goods', 24),
('Live station', 25),
('Rental Service', 26)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all operations categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Add category_id to products (optional, for proper normalization)
-- ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
