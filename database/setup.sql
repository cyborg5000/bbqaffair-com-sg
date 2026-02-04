-- BBQAffair Database Setup
-- Run this in Supabase SQL Editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('package', 'addon')),
  image_url text,
  min_pax integer DEFAULT 1,
  popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create product_items table (for package contents)
CREATE TABLE IF NOT EXISTS product_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create order number sequence
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1001;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number bigint UNIQUE DEFAULT nextval('orders_order_number_seq'),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  event_date date,
  event_address text,
  notes text,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_method text CHECK (payment_method IN ('stripe', 'paynow')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  event text,
  quote text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read items" ON product_items FOR SELECT USING (true);
CREATE POLICY "Allow public read testimonials" ON testimonials FOR SELECT USING (true);

-- RLS Policies for admin operations (allow all for now)
CREATE POLICY "Allow all operations products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations items" ON product_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);

-- Insert sample menu packages
INSERT INTO products (name, description, price, category, min_pax, popular) VALUES
('Classic BBQ Package', 'Perfect for casual gatherings and family events. Features grilled chicken wings, BBQ chicken thigh, hotdogs, corn on the cob, garlic bread, coleslaw, and soft drinks.', 25.00, 'package', 30, false),
('Premium BBQ Feast', 'Our most popular choice for corporate events. Includes grilled lamb chops, BBQ beef satay, honey glazed chicken, grilled prawns, BBQ stingray, grilled vegetables, fried rice, assorted desserts, and beverages.', 45.00, 'package', 25, true),
('Deluxe BBQ Experience', 'The ultimate BBQ experience for special occasions. Features Wagyu beef skewers, grilled lobster, premium lamb cutlets, marinated beef ribs, garlic butter prawns, grilled salmon, gourmet sausages, premium sides, charcuterie board, and free-flow beverages.', 65.00, 'package', 20, false);

-- Insert sample add-ons
INSERT INTO products (name, description, price, category) VALUES
('Live BBQ Station Chef', 'Professional chef on-site to grill and serve your guests', 150.00, 'addon'),
('Grill Rental', 'Includes setup, propane, and cleaning', 80.00, 'addon'),
('Tentage Setup', 'Basic tent with tables and chairs for up to 50 guests', 200.00, 'addon'),
('Vegetarian Package', 'Plant-based BBQ options. Per person, minimum 10 pax.', 18.00, 'addon'),
('Dessert Station', 'Assorted desserts display with service staff', 120.00, 'addon'),
('Additional Hour', 'Extend your BBQ event by one hour', 50.00, 'addon');

-- Insert product items for Classic BBQ
INSERT INTO product_items (product_id, item_name)
SELECT id, item FROM (
  SELECT id, unnest(ARRAY[
    'Grilled Chicken Wings (3 pcs/person)',
    'BBQ Chicken Thigh',
    'Hotdogs with Buns',
    'Corn on the Cob',
    'Garlic Bread',
    'Coleslaw',
    'Soft Drinks'
  ]) as item FROM products WHERE name = 'Classic BBQ Package'
) sub;

-- Insert product items for Premium BBQ
INSERT INTO product_items (product_id, item_name)
SELECT id, item FROM (
  SELECT id, unnest(ARRAY[
    'Grilled Lamb Chops',
    'BBQ Beef Satay (5 sticks)',
    'Honey Glazed Chicken',
    'Grilled Prawns (3 pcs)',
    'BBQ Stingray',
    'Grilled Vegetables',
    'Fried Rice / Noodles',
    'Assorted Desserts',
    'Soft Drinks & Juices'
  ]) as item FROM products WHERE name = 'Premium BBQ Feast'
) sub;

-- Insert product items for Deluxe BBQ
INSERT INTO product_items (product_id, item_name)
SELECT id, item FROM (
  SELECT id, unnest(ARRAY[
    'Wagyu Beef Skewers',
    'Grilled Lobster (1/2 pc)',
    'Premium Lamb Cutlets',
    'Marinated Beef Ribs',
    'Garlic Butter Prawns',
    'Grilled Salmon',
    'Gourmet Sausages',
    'Premium Sides Selection',
    'Charcuterie Board',
    'Free-flow Beverages'
  ]) as item FROM products WHERE name = 'Deluxe BBQ Experience'
) sub;

-- Insert sample testimonials
INSERT INTO testimonials (name, event, quote, rating) VALUES
('Sarah Chen', 'Corporate Event', 'BBQAffair made our company party absolutely amazing! The food was delicious and the service was top-notch.', 5),
('Michael Tan', 'Family Gathering', 'Best BBQ catering we have ever had. The lamb chops were cooked to perfection. Will definitely order again!', 5),
('Jennifer Lim', 'Birthday Party', 'Professional team, great food, hassle-free experience. Highly recommended for any event!', 5);
