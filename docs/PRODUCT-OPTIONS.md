# Product Options Feature

This document explains how to use the product options/variants feature for products with multiple flavors or types at different prices.

## Overview

The product options feature allows you to:
- Add multiple price variants to a single product (e.g., different flavors)
- Show original price with strike-through for sale items
- Configure unit labels (e.g., "1kg", "2kg", "per piece")
- Track which option customers selected in orders

## Example Use Case

**Product: BBQ Chicken Wings**

| Option | Current Price | Original Price |
|--------|--------------|----------------|
| Honey | $22.00 | $23.00 |
| Teriyaki | $22.00 | $23.00 |
| Black Pepper | $24.00 | $25.00 |
| Mala | $32.00 | $35.00 |
| Korean Bulgogi | $32.00 | $35.00 |

**Unit Label:** "1kg"

This displays as "Quantity (1kg): + 1" in the cart.

## How to Add Options (Admin Panel)

1. Go to **Admin → Products**
2. Click **Add Product** or edit an existing product
3. Fill in basic product info (name, description, base price, category, image)
4. Set the **Unit Label** (optional) - e.g., "1kg", "2kg", "per piece"
5. Check **"Has Options"** checkbox
6. Click **"+ Add Option"** for each variant:
   - **Name**: Option name (e.g., "Honey", "Mala")
   - **Price**: Current selling price
   - **Was $**: Original price for strike-through (leave empty if no discount)
   - **Default**: Select which option is pre-selected on product page
7. Click **Create** or **Update**

## How It Works

### Frontend (Customer View)

1. **Product Detail Page** (`/product/:id`)
   - Shows option selector buttons
   - Each button displays name and price
   - Strike-through price shown if original price > current price
   - Price updates when different option selected
   - "Add to Cart" shows total based on selected option

2. **Cart**
   - Shows product name with option name (e.g., "BBQ Chicken - Honey")
   - Shows unit label with quantity (e.g., "$22.00 / 1kg")
   - Strike-through original price if on sale

3. **Checkout**
   - Order summary shows option name
   - Price breakdown includes unit label

### Database Structure

```
products (parent)
  └── product_options (children)
      - Honey: $22 (was $23)
      - Teriyaki: $22 (was $23)
      - Mala: $32 (was $35)
```

### Cart Item Structure

When a product with options is added to cart:

```javascript
{
  id: "product-uuid",
  name: "BBQ Chicken Wings",
  price: 22.00,              // Selected option's current price
  quantity: 2,
  optionId: "option-uuid",   // Links to product_options.id
  optionName: "Honey",       // For display
  unitLabel: "1kg",          // From product.unit_label
  originalPrice: 23.00       // For strike-through display
}
```

## Code Files

| File | Purpose |
|------|---------|
| `src/data/menu.js` | Fetches products with options |
| `src/context/CartContext.jsx` | Cart state management with option support |
| `src/pages/ProductDetail.jsx` | Option selector UI |
| `src/pages/admin/AdminProducts.jsx` | Admin options editor |
| `src/components/Cart.jsx` | Cart display with options |
| `src/pages/Checkout.jsx` | Checkout with option details |
| `src/styles/product.css` | Option selector styles |

## Backwards Compatibility

- Products without options work exactly as before
- `has_options: false` (default) means product uses base `price` field
- Cart items without `optionId` use product ID as unique key
- All existing products continue to function unchanged

## API Examples

### Fetch Product with Options

```javascript
import { fetchProductById } from '../data/menu';

const product = await fetchProductById('product-uuid');
// Returns:
{
  id: 'uuid',
  name: 'BBQ Chicken Wings',
  price: 22.00,              // Base price
  unit_label: '1kg',
  has_options: true,
  product_options: [
    { id: 'opt1', name: 'Honey', current_price: 22, original_price: 23, is_default: true },
    { id: 'opt2', name: 'Mala', current_price: 32, original_price: 35, is_default: false }
  ]
}
```

### Add to Cart with Option

```javascript
import { useCart } from '../context/CartContext';

const { addToCart } = useCart();

addToCart({
  id: product.id,
  name: product.name,
  price: selectedOption.current_price,
  optionId: selectedOption.id,
  optionName: selectedOption.name,
  unitLabel: product.unit_label,
  originalPrice: selectedOption.original_price,
  quantity: 1
});
```

## Tips

1. **Default Option**: Always set one option as default so customers see a pre-selected choice
2. **Display Order**: Options are sorted by `display_order` - set this to control the order
3. **Strike-through Pricing**: Only shown when `original_price > current_price`
4. **Unit Label**: Appears after price and in quantity selector - use for weight/volume units
5. **Inactive Options**: Set `is_active: false` to hide an option without deleting it
