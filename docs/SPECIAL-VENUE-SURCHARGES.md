# Special Venue Surcharges (Postal Code Rules)

This document describes the postal-code based surcharge logic used on the `/checkout` page.

## How It Works
- Customers must enter a 6-digit postal code.
- The system matches the postal code against the lists/ranges below.
- If a match is found, an additional surcharge is added to the order total.
- The surcharge appears as its own line item in the order summary and checkout line items.
- The surcharge is also appended to the order notes for admin visibility.

## Surcharge Rules

### $40 Surcharge Venues
- NSRCC Changi: `499739`
- NSRCC Kranji: `718828`
- Sembawang Country Club: `758352`
- East Coast Park: `449874-449895`
- Labrador Park: `119187`, `119190`
- Changi Fairy Point (CSC): `509085`, `509088`, `509709`
- Sentosa (island-wide): `098xxx`, `099xxx`
- Tuas (industrial area): `636xxx`, `637xxx`, `639xxx`
- KI Residences: `599968`, `599973`, `599977`, `599981`
- 68 Hua Guan Avenue: `589164`
- Pavilion Green: `658287-658335`
- Sunny Parc: `425767`
- Hilltops: `229808`, `229809`

### $20 Surcharge Venues
- 3 Jalan Hajijah (Landbay): `468698`, `468700`, `468702`, `468704`, `468706`

### Variable Surcharge Venues
- Belmont Road / 42 Belmont Road: `269853-269916`
  - Base surcharge: $40
  - Large order surcharge: $60
  - Large order threshold: orders above $1000.

## Configuration (Code)
The logic is defined in `src/pages/Checkout.jsx` and uses the following constants:
- `SPECIAL_VENUE_RULES`
- `BELMONT_RANGE`
- `BELMONT_LARGE_ORDER_THRESHOLD`

If you need to change the large-order threshold or add new venues, update those constants and this document together.
