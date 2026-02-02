import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dndpcnyiqrtjfefpnqho.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ObCy8oNRPTbs5fY4nz1hvg_sRVJIU3I';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions

// Fetch all products
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

// Fetch product by ID
export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

// Create order
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    return null;
  }
  return data;
}

// Create order items (returns created items with IDs)
export async function createOrderItems(orderItems) {
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (error) {
    console.error('Error creating order items:', error);
    return null;
  }
  return data;
}

// Create order item addons
export async function createOrderItemAddons(orderItemAddons) {
  if (!orderItemAddons || orderItemAddons.length === 0) return [];

  const { data, error } = await supabase
    .from('order_item_addons')
    .insert(orderItemAddons)
    .select();

  if (error) {
    console.error('Error creating order item addons:', error);
    return null;
  }
  return data;
}

// Fetch orders by customer email
export async function fetchOrdersByEmail(email) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data;
}

// Upload image to storage
export async function uploadImage(file, path) {
  const { data, error } = await supabase
    .storage
    .from('bbqaffair-images')
    .upload(path, file);
  
  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }
  return data;
}

// Get public URL for image
export function getImageUrl(path) {
  const { data } = supabase
    .storage
    .from('bbqaffair-images')
    .getPublicUrl(path);
  
  return data.publicUrl;
}

export default supabase;
