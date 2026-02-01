import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dndpcnyiqrtjfefpnqho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZHBjbnlpcXJ0amZlZnBucWhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMzk2NiwiZXhwIjoyMDg1NDc5OTY2fQ.mofDazpwvPNPVWgVzJqdItAFCwuZ61DemXNk6wsR0T0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTables() {
  console.log('Creating tables...');
  
  // Create products table using raw SQL via RPC
  const { error: productsError } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS products (
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
    )`
  });
  
  if (productsError) {
    console.error('Products table error:', productsError);
    // Try direct insert to test if table exists
    const { error: testError } = await supabase.from('products').select('count').limit(1);
    if (testError && testError.code === '42P01') {
      console.log('Table does not exist, need to create via SQL Editor');
    } else {
      console.log('Table might already exist');
    }
  } else {
    console.log('✅ Products table created');
  }
  
  // Create product_items table
  const { error: itemsError } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS product_items (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      product_id uuid REFERENCES products(id) ON DELETE CASCADE,
      item_name text NOT NULL,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    )`
  });
  
  if (itemsError) {
    console.error('Product items table error:', itemsError);
  } else {
    console.log('✅ Product items table created');
  }
  
  console.log('Setup complete!');
}

setupTables();
