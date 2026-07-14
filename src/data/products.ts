import type { Product } from "../types";

// Sample catalog. Swap `image` for real product photos in /public later,
// or serve this list from json-server (see db.json).
// TODO(rnd-muse): none of these have real weightKg/lengthCm/breadthCm/heightCm —
// Shiprocket shipping-rate calculation falls back to placeholder defaults
// (see getShippingDims in src/lib/pricing.ts) until real values are filled in per SKU.
export const products: Product[] = [
  {
    id: "bag-01",
    name: "Meenakari Sling Bag",
    category: "bags",
    price: 1299, mrp: 1799, rating: 4.6, stock: 12,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
    tags: ["sling", "everyday", "handcrafted"],
    description: "A compact sling with enamel-inspired detailing. Roomy enough for the essentials, light enough for all-day wear.",
  },
  {
    id: "bag-02",
    name: "Jaipur Jacquard Tote",
    category: "bags",
    price: 1899, mrp: 2499, rating: 4.8, stock: 7,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    tags: ["tote", "work", "roomy"],
    description: "A structured tote in woven jacquard with a brass-tone clasp. Fits a tablet, a bottle, and everything in between.",
  },
  {
    id: "ear-01",
    name: "Kundan Chandbali Earrings",
    category: "earrings",
    price: 899, mrp: 1299, rating: 4.9, stock: 25,
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&q=80",
    tags: ["kundan", "festive", "statement"],
    description: "Crescent-shaped chandbalis with kundan work and pearl drops. The one pair that finishes every ethnic look.",
  },
  {
    id: "ear-02",
    name: "Minimal Gold Hoops",
    category: "earrings",
    price: 499, rating: 4.4, stock: 40,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80",
    tags: ["hoops", "everyday", "minimal"],
    description: "Lightweight brass-tone hoops that go from desk to dinner. Hypoallergenic posts, feather-light feel.",
  },
  {
    id: "fes-01",
    name: "Navratri Oxidised Jhumka Set",
    category: "festive",
    price: 749, mrp: 999, rating: 4.7, stock: 18,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
    tags: ["navratri", "oxidised", "jhumka"],
    description: "Oxidised silver-tone jhumkas with ghungroo drops — made to move when you do the garba.",
  },
  {
    id: "fes-02",
    name: "Mirror-Work Potli Bag",
    category: "festive",
    price: 999, mrp: 1399, rating: 4.5, stock: 9,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80",
    tags: ["navratri", "potli", "mirror"],
    description: "A drawstring potli with mirror-work embroidery. The perfect festive companion for your lehenga or kurta.",
  },
  {
    id: "hair-01",
    name: "Enamel Floral Hair Clips (Set of 3)",
    category: "hair",
    price: 349, rating: 4.3, stock: 50,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80",
    tags: ["clips", "everyday", "set"],
    description: "Three enamel floral clips in complementary tones. Strong grip, gentle on hair.",
  },
  {
    id: "ban-01",
    name: "Lac Bangles Stack (Set of 6)",
    category: "bangles",
    price: 599, mrp: 899, rating: 4.6, stock: 15,
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80",
    tags: ["lac", "festive", "stack"],
    description: "A hand-set stack of lac bangles with stonework. Layer them or wear a couple — your call.",
  },
];

export const categories: { id: Product["category"]; label: string }[] = [
  { id: "bags", label: "Bags" },
  { id: "earrings", label: "Earrings" },
  { id: "festive", label: "Festive & Navratri" },
  { id: "hair", label: "Hair" },
  { id: "bangles", label: "Bangles" },
];
