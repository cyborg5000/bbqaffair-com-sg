import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dndpcnyiqrtjfefpnqho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZHBjbnlpcXJ0amZlZnBucWhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMzk2NiwiZXhwIjoyMDg1NDc5OTY2fQ.mofDazpwvPNPVWgVzJqdItAFCwuZ61DemXNk6wsR0T0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndSeed() {
  console.log('Checking if products table exists...');
  
  // Try to query products
  const { data, error } = await supabase.from('products').select('*').limit(1);
  
  if (error) {
    console.error('❌ Table does not exist:', error.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase Editor:');
    console.log('https://app.supabase.com/project/dndpcnyiqrtjfefpnqho/editor');
    console.log('\nSQL file location:');
    console.log('~/Documents/GitHub/Clients/bbqaffair-com-sg/database/setup.sql');
    return;
  }
  
  console.log('✅ Products table exists!');
  
  // Check if there's any data
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Found ${count} products`);
  
  if (count === 0) {
    console.log('Seeding with sample data...');
    
    // Insert sample products
    const { error: insertError } = await supabase.from('products').insert([
      { name: 'Classic BBQ Package', description: 'Perfect for casual gatherings', price: 25.00, category: 'package', min_pax: 30, popular: false },
      { name: 'Premium BBQ Feast', description: 'Most popular for corporate events', price: 45.00, category: 'package', min_pax: 25, popular: true },
      { name: 'Deluxe BBQ Experience', description: 'Ultimate BBQ for special occasions', price: 65.00, category: 'package', min_pax: 20, popular: false },
      { name: 'Live BBQ Station Chef', description: 'Professional chef on-site', price: 150.00, category: 'addon' },
      { name: 'Grill Rental', description: 'Includes setup & cleaning', price: 80.00, category: 'addon' },
      { name: 'Tentage Setup', description: 'Basic tent with tables & chairs', price: 200.00, category: 'addon' }
    ]);
    
    if (insertError) {
      console.error('❌ Error seeding:', insertError);
    } else {
      console.log('✅ Sample data inserted!');
    }
  } else {
    console.log('Data already exists, skipping seed');
  }
}

checkAndSeed();
