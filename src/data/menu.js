// BBQ Menu Data
export const menuPackages = [
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

export const addOns = [
  { name: "Live BBQ Station Chef", price: "$150", description: "Professional chef on-site" },
  { name: "Grill Rental", price: "$80", description: "Includes setup & cleaning" },
  { name: "Tentage Setup", price: "$200", description: "Basic tent with tables & chairs" },
  { name: "Additional Hour", price: "$50", description: "Extend service time" },
  { name: "Vegetarian Package", price: "$18", description: "Per person, min 10 pax" },
  { name: "Dessert Station", price: "$120", description: "Assorted desserts display" }
];

export const testimonials = [
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

export const galleryImages = [
  { id: 1, category: "food", alt: "Grilled Lamb Chops" },
  { id: 2, category: "food", alt: "BBQ Satay" },
  { id: 3, category: "event", alt: "Corporate Event Setup" },
  { id: 4, category: "food", alt: "Seafood Platter" },
  { id: 5, category: "event", alt: "Family Gathering" },
  { id: 6, category: "food", alt: "Premium Meat Selection" }
];
