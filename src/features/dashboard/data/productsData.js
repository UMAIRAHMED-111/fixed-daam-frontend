/** Seed products shown as fallback when the API returns no products. */

const CATEGORIES = ["Electronics", "Groceries", "Home", "Fashion", "Sports"];

const PRODUCTS = [
  {
    id: "1",
    merchantId: null,
    merchantName: "TechHub",
    name: "Wireless Bluetooth Headphones",
    description: "Premium over-ear headphones with noise cancellation. 30-hour battery, comfortable for all-day use.",
    price: 89.99,
    category: "Electronics",
    stock: 24,
    images: [
      "https://loremflickr.com/800/600/headphones,wireless?lock=1",
      "https://loremflickr.com/800/600/headphones,earphones?lock=2",
      "https://loremflickr.com/800/600/headphones,music?lock=3",
    ],
  },
  {
    id: "2",
    merchantId: null,
    merchantName: "FreshMart",
    name: "Organic Olive Oil 500ml",
    description: "Cold-pressed extra virgin olive oil. Perfect for cooking and dressings.",
    price: 12.49,
    category: "Groceries",
    stock: 150,
    images: [
      "https://loremflickr.com/800/600/olive,oil,bottle?lock=1",
      "https://loremflickr.com/800/600/olive,oil,cooking?lock=2",
    ],
  },
  {
    id: "3",
    merchantId: null,
    merchantName: "HomeStyle",
    name: "Minimalist Desk Lamp",
    description: "LED desk lamp with adjustable brightness and warm/cool light modes.",
    price: 45.0,
    category: "Home",
    stock: 42,
    images: [
      "https://loremflickr.com/800/600/desk,lamp?lock=1",
      "https://loremflickr.com/800/600/lamp,light?lock=2",
    ],
  },
  {
    id: "4",
    merchantId: null,
    merchantName: "UrbanWear",
    name: "Cotton Crew Neck T-Shirt",
    description: "100% organic cotton, available in multiple colors. Classic fit.",
    price: 24.99,
    category: "Fashion",
    stock: 200,
    images: [
      "https://loremflickr.com/800/600/tshirt,cotton?lock=1",
      "https://loremflickr.com/800/600/tshirt,clothing?lock=2",
    ],
  },
  {
    id: "5",
    merchantId: null,
    merchantName: "RunFast",
    name: "Running Shoes Lightweight",
    description: "Breathable mesh upper, cushioned sole. Ideal for daily runs.",
    price: 79.99,
    category: "Sports",
    stock: 38,
    images: [
      "https://loremflickr.com/800/600/running,shoes?lock=1",
      "https://loremflickr.com/800/600/sneakers,shoes?lock=2",
    ],
  },
];

/**
 * All products for buyers.
 * Returns API products when available; falls back to seed data when the backend is offline.
 */
export function getAllProducts(apiProducts = []) {
  return apiProducts.length > 0 ? apiProducts : PRODUCTS;
}

export { PRODUCTS, CATEGORIES };
