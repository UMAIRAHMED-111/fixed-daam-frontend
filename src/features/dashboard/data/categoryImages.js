/**
 * Curated stock images per product category (Unsplash CDN).
 * Each category has a small pool — we deterministically pick one based on the
 * product id so the same product keeps the same fallback image across renders.
 *
 * If the URL ever fails to load (network/Unsplash issue), the <ProductImage>
 * component falls back to a tinted background + category emoji.
 */

const unsplash = (id, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const STOCK_IMAGES_BY_CATEGORY = {
  groceries: [
    unsplash("photo-1509440159596-0249088772ff"), // sourdough bread
    unsplash("photo-1488459716781-31db52582fe9"), // vegetables still life
    unsplash("photo-1610348725531-843dff563e2c"), // citrus fruit
    unsplash("photo-1542838132-92c53300491e"), // grocery paper bag
    unsplash("photo-1596040033229-a9821ebd058d"), // spices
    unsplash("photo-1543168256-418811576931"), // milk / dairy
  ],
  electronics: [
    unsplash("photo-1505740420928-5e560c06d30e"), // headphones
    unsplash("photo-1496181133206-80ce9b88a853"), // laptop
    unsplash("photo-1587829741301-dc798b83add3"), // mechanical keyboard
    unsplash("photo-1592899677977-9c10ca588bbd"), // smartphone
    unsplash("photo-1502920917128-1aa500764cbd"), // camera
    unsplash("photo-1546054454-aa26e2b734c7"), // gadget setup
  ],
  home: [
    unsplash("photo-1555041469-a586c61ea9bc"), // sofa
    unsplash("photo-1567538096630-e0c55bd6374c"), // lamp / vase
    unsplash("photo-1493663284031-b7e3aefcae8e"), // interior
    unsplash("photo-1556909114-f6e7ad7d3136"), // potted plant
    unsplash("photo-1556228720-195a672e8a03"), // kitchen
    unsplash("photo-1513694203232-719a280e022f"), // bedroom
  ],
  fashion: [
    unsplash("photo-1521572163474-6864f9cf17ab"), // white t-shirt
    unsplash("photo-1525507119028-ed4c629a60a3"), // sneakers
    unsplash("photo-1551028719-00167b16eac5"), // denim jacket
    unsplash("photo-1515886657613-9f3515b0c78f"), // handbag
    unsplash("photo-1523275335684-37898b6baf30"), // watch
    unsplash("photo-1572635196237-14b3f281503f"), // sunglasses
  ],
  sports: [
    unsplash("photo-1517649763962-0c623066013b"), // running
    unsplash("photo-1546519638-68e109498ffc"), // basketball court
    unsplash("photo-1571902943202-507ec2618e8f"), // gym
    unsplash("photo-1545205597-3d9d02c29597"), // yoga mat
    unsplash("photo-1532298229144-0ec0c57515c7"), // road bike
    unsplash("photo-1599058917212-d750089bc07e"), // dumbbells
  ],
};

const FALLBACK_POOL = [
  unsplash("photo-1607082348824-0a96f2a4b9da"), // gift box
  unsplash("photo-1607083206869-4c7672e72a8a"), // shipping boxes
  unsplash("photo-1556742044-3c52d6e88c62"), // generic product
];

export const CATEGORY_EMOJI = {
  groceries: "🛒",
  electronics: "🎧",
  home: "🛋️",
  fashion: "👕",
  sports: "⚽",
};

export const CATEGORY_TINT = {
  groceries: "bg-emerald-100 text-emerald-700",
  electronics: "bg-sky-100 text-sky-700",
  home: "bg-amber-100 text-amber-700",
  fashion: "bg-rose-100 text-rose-700",
  sports: "bg-violet-100 text-violet-700",
  default: "bg-slate-100 text-slate-500",
};

/** djb2-style stable hash over a string — used to pick an image deterministically. */
function stableHash(str) {
  let hash = 5381;
  const s = String(str ?? "");
  for (let i = 0; i < s.length; i += 1) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const normalizeCategory = (category) =>
  String(category || "").toLowerCase().trim();

/**
 * Pick a category-appropriate image for a product. Stable per-product so
 * the same item keeps the same fallback across renders.
 */
export function pickStockImage(product) {
  const cat = normalizeCategory(product?.category);
  const pool = STOCK_IMAGES_BY_CATEGORY[cat] || FALLBACK_POOL;
  const seed = stableHash(product?.id || product?.name || product?.category || "x");
  return pool[seed % pool.length];
}

export function categoryEmoji(category) {
  return CATEGORY_EMOJI[normalizeCategory(category)] || "📦";
}

export function categoryTint(category) {
  return CATEGORY_TINT[normalizeCategory(category)] || CATEGORY_TINT.default;
}
