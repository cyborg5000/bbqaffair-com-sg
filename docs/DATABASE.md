# BBQAffair Database Structure

This document describes the Supabase (PostgreSQL) database structure for the BBQAffair e-commerce site.

## Overview

The database uses Supabase with PostgreSQL. All tables have Row Level Security (RLS) enabled for public read access.

## Tables

### products

Main table for all products (BBQ packages, add-ons, individual items).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `name` | text | Product name (required) |
| `description` | text | Product description |
| `price` | decimal(10,2) | Base price (used when no options) |
| `category` | text | Product category (e.g., "Chicken", "Pork", "BBQ Package") |
| `image_url` | text | URL to product image |
| `is_active` | boolean | Whether product is visible (default: true) |
| `popular` | boolean | Mark as popular/featured |
| `min_pax` | integer | Minimum pax for package deals |
| `unit_label` | text | Unit display label (e.g., "1kg", "2kg", "per piece") |
| `has_options` | boolean | Whether product has price variants (default: false) |
| `created_at` | timestamp | Creation timestamp |

### product_options

Stores price variants/options for products (e.g., different flavors at different prices).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `product_id` | uuid | Foreign key to products table |
| `name` | text | Option name (e.g., "Honey", "Teriyaki", "Mala") |
| `current_price` | decimal(10,2) | Current selling price |
| `original_price` | decimal(10,2) | Original price for strike-through display (optional) |
| `display_order` | integer | Sort order for options (default: 0) |
| `is_default` | boolean | Default selected option (default: false) |
| `is_active` | boolean | Whether option is visible (default: true) |
| `created_at` | timestamp | Creation timestamp |

### categories

Product categories for menu organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Category name |
| `is_active` | boolean | Whether category is visible |
| `display_order` | integer | Sort order for categories |

### orders

Customer orders.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `customer_name` | text | Customer full name |
| `customer_email` | text | Customer email |
| `customer_phone` | text | Customer phone number |
| `event_date` | date | Event date |
| `event_address` | text | Event location |
| `notes` | text | Special requests |
| `total_price` | decimal(10,2) | Order total |
| `status` | text | Order status (pending, confirmed, completed, cancelled) |
| `created_at` | timestamp | Order creation timestamp |

### testimonials

Customer reviews/testimonials.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Customer name |
| `event` | text | Event type |
| `quote` | text | Testimonial text |
| `rating` | integer | Star rating (1-5) |
| `created_at` | timestamp | Creation timestamp |

## Relationships

```
products
    │
    └──< product_options (one-to-many)
         FK: product_id → products.id
         ON DELETE CASCADE
```

## Migration SQL

To add product options support to an existing database:

```sql
-- Add columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_label text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_options boolean DEFAULT false;

-- Create product_options table
CREATE TABLE IF NOT EXISTS product_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  current_price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  display_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);

-- Enable Row Level Security
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read product_options" ON product_options FOR SELECT USING (true);

-- Allow all operations (for admin)
CREATE POLICY "Allow all operations product_options" ON product_options FOR ALL USING (true) WITH CHECK (true);
```

## Supabase Configuration

The database client is configured in `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Storage

Images are stored in the `bbqaffair-images` Supabase Storage bucket.

Helper functions in `src/lib/supabase.js`:
- `uploadImage(file, path)` - Upload image to storage
- `getImageUrl(path)` - Get public URL for image
