# Admin Guide

Quick reference for managing products and orders.

## Accessing Admin Panel

1. Go to `/admin`
2. Log in with admin credentials
3. Navigate using the sidebar

## Products

### Adding a New Product

1. Go to **Products** in sidebar
2. Click **+ Add Product**
3. Fill in:
   - **Name**: Product name
   - **Description**: Product details
   - **Price**: Base price (used if no options)
   - **Category**: Select or type category name
   - **Image URL**: Link to product image
   - **Active**: Whether product is visible on site

### Adding Product Options (Flavors/Variants)

For products with multiple flavors at different prices:

1. Edit or create a product
2. Set **Unit Label** (e.g., "1kg", "per piece") - optional
3. Check **"Has Options"**
4. Click **"+ Add Option"**
5. For each option, enter:
   - **Name**: Flavor/variant name (e.g., "Honey", "Mala")
   - **Price**: Current selling price
   - **Was $**: Original price (for strike-through, optional)
   - **Default**: Select one as the default choice
6. Save the product

### Example: Adding BBQ Wings with Flavors

```
Product Name: BBQ Chicken Wings
Base Price: $22.00 (fallback)
Unit Label: 1kg
Has Options: Yes

Options:
1. Honey - $22.00 (was $23.00) [Default]
2. Teriyaki - $22.00 (was $23.00)
3. Black Pepper - $24.00 (was $25.00)
4. Mala - $32.00 (was $35.00)
```

### Product Categories

Current categories include:
- Special Set 2026
- Chef and Service Staff
- BBQ Package
- Chicken, Pork, Lamb, Premium Beef
- Seafood, Baby Lobster
- Sausage, Otah, Satay
- Cooked Food (Mains/Sides)
- Salad, Sides, Vegetarian
- Dessert, Dessert Tarts
- Drinks, Sauces, Dry Goods
- Live Station, Rental Service
- And more...

## Orders

### Viewing Orders

1. Go to **Orders** in sidebar
2. Orders are sorted by date (newest first)
3. Click **View** to see order details

### Order Statuses

| Status | Meaning |
|--------|---------|
| Pending | New order, needs confirmation |
| Confirmed | Order accepted, scheduled |
| Completed | Event completed |
| Cancelled | Order cancelled |

### Order Details Include

- Customer name, email, phone
- Event date and address
- Special notes/requests
- Items ordered (with options selected)
- Total price
- Payment method

## Dashboard

The dashboard shows:
- Total orders count
- Recent orders
- Quick action links

## Tips

1. **Images**: Use square images for best display (recommended 500x500px)
2. **Descriptions**: Keep descriptions concise but informative
3. **Pricing**: Always use decimal format (e.g., 22.00, not 22)
4. **Categories**: Use consistent category names for proper menu grouping
5. **Options**: Set display order to control option sorting (lower numbers first)
