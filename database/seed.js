import { supabase } from '../src/lib/supabase.js';

// Menu data from take.app and current site
const menuData = [
  {
    name: 'Classic BBQ Package',
    description: 'Perfect for casual gatherings and family events',
    price: 25.00,
    category: 'package',
    min_pax: 30,
    popular: false,
    items: [
      'Grilled Chicken Wings (3 pcs/person)',
      'BBQ Chicken Thigh',
      'Hotdogs with Buns',
      'Corn on the Cob',
      'Garlic Bread',
      'Coleslaw',
      'Soft Drinks'
    ]
  },
  {
    name: 'Premium BBQ Feast',
    description: 'Our most popular choice for corporate events',
    price: 45.00,
    category: 'package',
    min_pax: 25,
    popular: true,
    items: [
      'Grilled Lamb Chops',
      'BBQ Beef Satay (5 sticks)',
      'Honey Glazed Chicken',
      'Grilled Prawns (3 pcs)',
      'BBQ Stingray',
      'Grilled Vegetables',
      'Fried Rice / Noodles',
      'Assorted Desserts',
      'Soft Drinks & Juices'
    ]
  },
  {
    name: 'Deluxe BBQ Experience',
    description: 'The ultimate BBQ experience for special occasions',
    price: 65.00,
    category: 'package',
    min_pax: 20,
    popular: false,
    items: [
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
    ]
  },
  {
    name: 'Live BBQ Station Chef',
    description: 'Professional chef on-site to grill fresh',
    price: 150.00,
    category: 'addon',
    popular: false,
    items: []
  },
  {
    name: 'Grill Rental',
    description: 'Includes setup & cleaning',
    price: 80.00,
    category: 'addon',
    popular: false,
    items: []
  },
  {
    name: 'Tentage Setup',
    description: 'Basic tent with tables & chairs',
    price: 200.00,
    category: 'addon',
    popular: false,
    items: []
  },
  {
    name: 'Vegetarian Package',
    description: 'Per person, minimum 10 pax',
    price: 18.00,
    category: 'addon',
    min_pax: 10,
    popular: false,
    items: [
      'Grilled Vegetable Skewers',
      'Portobello Mushrooms',
      'Corn on the Cob',
      'Garlic Bread',
      'Salads'
    ]
  },
  {
    name: 'Dessert Station',
    description: 'Assorted desserts display',
    price: 120.00,
    category: 'addon',
    popular: false,
    items: [
      'Assorted Cakes',
      'Fresh Fruits',
      'Ice Cream Station'
    ]
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    event: 'Corporate Event',
    quote: 'BBQAffair made our company party absolutely amazing! The food was delicious and the service was top-notch.',
    rating: 5
  },
  {
    name: 'Michael Tan',
    event: 'Family Gathering',
    quote: 'Best BBQ catering we\'ve ever had. The lamb chops were cooked to perfection. Will definitely order again!',
    rating: 5
  },
  {
    name: 'Jennifer Lim',
    event: 'Birthday Party',
    quote: 'Professional team, great food, hassle-free experience. Highly recommended for any event!',
    rating: 5
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await supabase.from('product_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert products
  console.log('Inserting products...');
  for (const product of menuData) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        min_pax: product.min_pax || null,
        popular: product.popular
      }])
      .select()
      .single();

    if (productError) {
      console.error(`Error inserting ${product.name}:`, productError);
      continue;
    }

    console.log(`✅ Added: ${product.name}`);

    // Insert product items if any
    if (product.items && product.items.length > 0) {
      const items = product.items.map(item => ({
        product_id: productData.id,
        item_name: item
      }));

      const { error: itemsError } = await supabase
        .from('product_items')
        .insert(items);

      if (itemsError) {
        console.error(`Error inserting items for ${product.name}:`, itemsError);
      }
    }
  }

  // Insert testimonials
  console.log('\nInserting testimonials...');
  for (const testimonial of testimonials) {
    const { error } = await supabase
      .from('testimonials')
      .insert([testimonial]);

    if (error) {
      console.error(`Error inserting testimonial:`, error);
    } else {
      console.log(`✅ Added testimonial from ${testimonial.name}`);
    }
  }

  console.log('\n✨ Database seeding complete!');
}

seedDatabase().catch(console.error);
