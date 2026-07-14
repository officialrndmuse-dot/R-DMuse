import type { BlogPost } from "../types";

export const posts: BlogPost[] = [
  {
    id: "p1",
    slug: "styling-jhumkas-for-navratri",
    title: "5 Ways to Style Jhumkas for Navratri",
    excerpt: "From garba nights to the aarti — pair your jhumkas like a pro.",
    cover: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80",
    author: "Team RnD Muse",
    date: "2025-09-18",
    tags: ["festive", "styling", "navratri"],
    body: "Navratri is nine nights of colour, movement and celebration — and the right jhumkas tie every look together.\n\nStart with oxidised jhumkas for the garba floor. They're light, they catch the light, and they move with you.\n\nFor the quieter aarti mornings, switch to smaller studs or a delicate chandbali. Let your outfit lead and keep the earrings soft.\n\nMixing metals? Keep your bag hardware in the same tone as your earrings — small detail, big difference.",
  },
  {
    id: "p2",
    slug: "how-to-care-for-oxidised-jewellery",
    title: "How to Care for Oxidised Jewellery",
    excerpt: "Keep that antique finish looking rich for years.",
    cover: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80",
    author: "Team RnD Muse",
    date: "2025-08-02",
    tags: ["care", "jewellery"],
    body: "Oxidised jewellery has a deliberately antique finish — and a little care keeps it that way.\n\nKeep it dry. Take earrings off before a shower or a workout, and store them in a zip pouch away from moisture.\n\nWipe gently with a soft dry cloth after wearing. Avoid perfume and sanitiser directly on the metal.\n\nWith these habits, your favourite pieces stay rich and dramatic season after season.",
  },
  {
    id: "p3",
    slug: "one-bag-three-looks",
    title: "One Bag, Three Looks",
    excerpt: "Why a good sling is the hardest-working thing in your wardrobe.",
    cover: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&q=80",
    author: "Team RnD Muse",
    date: "2025-07-11",
    tags: ["bags", "styling"],
    body: "The right sling bag quietly earns its place in every outfit.\n\nFor work, keep it structured and neutral so it disappears into a polished look.\n\nFor evenings, a bit of shine or detailing turns the same silhouette into a statement.\n\nOn weekends, go crossbody and hands-free. One bag, three completely different moods.",
  },
];

// All unique tags across posts — used to build the blog filter
export const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
