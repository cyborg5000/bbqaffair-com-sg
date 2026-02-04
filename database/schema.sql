# BBQAffair Supabase Database Schema

## Environment Variables

Create `.env` file in project root:
```
VITE_SUPABASE_URL=https://dndpcnyiqrtjfefpnqho.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ObCy8oNRPTbs5fY4nz1hvg_sRVJIU3I
```

## Tables

### 1. products
Main products/services table

```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  category text not null, -- 'package', 'addon', 'service'
  image_url text,
  min_pax integer,
  popular boolean default false,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 2. product_items
Items included in each package

```sql
create table product_items (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  item_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 3. orders
Customer orders

```sql
create sequence orders_order_number_seq start 1001;

create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number bigint unique default nextval('orders_order_number_seq'),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  event_date date,
  event_address text,
  notes text,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  payment_method text, -- 'stripe', 'paynow'
  payment_status text default 'pending', -- 'pending', 'paid', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 4. order_items
Individual items in each order

```sql
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  price decimal(10,2) not null,
  quantity integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 5. testimonials
Customer testimonials

```sql
create table testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  event text,
  quote text not null,
  rating integer default 5,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Storage Buckets

Create bucket: `bbqaffair-images`
- Public bucket for product images
- Folder structure:
  - `/products/` - Product images
  - `/gallery/` - Event gallery
  - `/qr-codes/` - PayNow QR

## Sample Data

### Products (Menu Packages)

```sql
-- Classic BBQ Package
INSERT INTO products (name, description, price, category, min_pax, popular) VALUES
('Classic BBQ Package', 'Perfect for casual gatherings', 25.00, 'package', 30, false);

-- Premium BBQ Feast
INSERT INTO products (name, description, price, category, min_pax, popular) VALUES
('Premium BBQ Feast', 'Most popular for corporate events', 45.00, 'package', 25, true);

-- Deluxe BBQ Experience
INSERT INTO products (name, description, price, category, min_pax, popular) VALUES
('Deluxe BBQ Experience', 'Ultimate BBQ for special occasions', 65.00, 'package', 20, false);
```

### Add-ons

```sql
INSERT INTO products (name, description, price, category) VALUES
('Live BBQ Station Chef', 'Professional chef on-site', 150.00, 'addon');

INSERT INTO products (name, description, price, category) VALUES
('Grill Rental', 'Includes setup & cleaning', 80.00, 'addon');

INSERT INTO products (name, description, price, category) VALUES
('Tentage Setup', 'Basic tent with tables & chairs', 200.00, 'addon');

INSERT INTO products (name, description, price, category) VALUES
('Vegetarian Package', 'Per person, min 10 pax', 18.00, 'addon');
```

## Setup Instructions

1. Go to Supabase Dashboard: https://app.supabase.io
2. Connect to project: `dndpcnyiqrtjfefpnqho`
3. Create tables using SQL Editor
4. Create storage bucket `bbqaffair-images`
5. Set bucket to public
6. Insert sample data
7. Configure Row Level Security (RLS) policies

## RLS Policies

```sql
-- Products: Allow public read
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Orders: Allow insert, customer can read own orders
CREATE POLICY "Allow insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow customer to view own orders" ON orders
  FOR SELECT USING (customer_email = current_user);

-- Testimonials: Allow public read
CREATE POLICY "Allow public read" ON testimonials
  FOR SELECT USING (active = true);
```
