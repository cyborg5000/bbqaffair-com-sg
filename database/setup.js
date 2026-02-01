import { supabase } from '../src/lib/supabase.js';

async function setupDatabase() {
  console.log('Setting up database...');

  // Create products table
  const { error: productsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        description text,
        price decimal(10,2) NOT NULL,
        category text NOT NULL,
        image_url text,
        min_pax integer,
        popular boolean DEFAULT false,
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
      );
    `
  });

  if (productsError) {
    console.error('Error creating products table:', productsError);
  } else {
    console.log('✅ Products table created');
  }

  // Create product_items table
  const { error: itemsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS product_items (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        item_name text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
      );
    `
  });

  if (itemsError) {
    console.error('Error creating product_items table:', itemsError);
  } else {
    console.log('✅ Product items table created');
  }

  console.log('Database setup complete!');
}

setupDatabase();
