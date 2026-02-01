import { supabase } from '../lib/supabase';

// Fetch products from Supabase
export async function fetchMenuPackages() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_items(item_name)
    `)
    .eq('category', 'package')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching menu packages:', error);
    return [];
  }

  // Transform data to match component expectations
  return data.map(product => ({
    id: product.id,
    name: product.name,
    price: `$${product.price}`,
    perPerson: '/person',
    minPax: product.min_pax,
    description: product.description,
    items: product.product_items?.map(item => item.item_name) || [],
    popular: product.popular,
    image: product.image_url
  }));
}

// Fetch add-ons from Supabase
export async function fetchAddOns() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'addon')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching add-ons:', error);
    return [];
  }

  return data.map(product => ({
    id: product.id,
    name: product.name,
    price: `$${product.price}`,
    description: product.description,
    minPax: product.min_pax
  }));
}

// Fetch testimonials from Supabase
export async function fetchTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data;
}

// Fallback static data (used if database is empty or error)
export const staticMenuPackages = [
  {
    id: 1,
    name: "Classic BBQ Package",
    price: "$25",
    perPerson: "/person",
    minPax: 30,
    description: "Perfect for casual gatherings and family events",
    items: [
      "Grilled Chicken Wings (3 pcs/person)",
      "BBQ Chicken Thigh",
      "Hotdogs with Buns",
      "Corn on the Cob",
      "Garlic Bread",
      "Coleslaw",
      "Soft Drinks"
    ],
    popular: false
  },
  {
    id: 2,
    name: "Premium BBQ Feast",
    price: "$45",
    perPerson: "/person",
    minPax: 25,
    description: "Our most popular choice for corporate events",
    items: [
      "Grilled Lamb Chops",
      "BBQ Beef Satay (5 sticks)",
      "Honey Glazed Chicken",
      "Grilled Prawns (3 pcs)",
      "BBQ Stingray",
      "Grilled Vegetables",
      "Fried Rice / Noodles",
      "Assorted Desserts",
      "Soft Drinks & Juices"
    ],
    popular: true
  },
  {
    id: 3,
    name: "Deluxe BBQ Experience",
    price: "$65",
    perPerson: "/person",
    minPax: 20,
    description: "The ultimate BBQ experience for special occasions",
    items: [
      "Wagyu Beef Skewers",
      "Grilled Lobster (1/2 pc)",
      "Premium Lamb Cutlets",
      "Marinated Beef Ribs",
      "Garlic Butter Prawns",
      "Grilled Salmon",
      "Gourmet Sausages",
      "Premium Sides Selection",
      "Charcuterie Board",
      "Free-flow Beverages"
    ],
    popular: false
  }
];

export const staticAddOns = [
  { id: 'a1', name: "Live BBQ Station Chef", price: "$150", description: "Professional chef on-site" },
  { id: 'a2', name: "Grill Rental", price: "$80", description: "Includes setup & cleaning" },
  { id: 'a3', name: "Tentage Setup", price: "$200", description: "Basic tent with tables & chairs" },
  { id: 'a4', name: "Additional Hour", price: "$50", description: "Extend service time" },
  { id: 'a5', name: "Vegetarian Package", price: "$18", description: "Per person, min 10 pax" },
  { id: 'a6', name: "Dessert Station", price: "$120", description: "Assorted desserts display" }
];

export const staticTestimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    event: "Corporate Event",
    quote: "BBQAffair made our company party absolutely amazing! The food was delicious and the service was top-notch.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Tan",
    event: "Family Gathering",
    quote: "Best BBQ catering we've ever had. The lamb chops were cooked to perfection. Will definitely order again!",
    rating: 5
  },
  {
    id: 3,
    name: "Jennifer Lim",
    event: "Birthday Party",
    quote: "Professional team, great food, hassle-free experience. Highly recommended for any event!",
    rating: 5
  }
];
