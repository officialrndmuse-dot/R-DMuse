-- Run this once, after schema.sql, to seed the same 8 products and 3 blog
-- posts that used to live in src/data/products.ts and src/data/posts.ts.
-- Safe to skip if you'd rather start from an empty catalog and add
-- everything fresh via the CRM.

insert into products (name, category, price, mrp, rating, stock, image, tags, description) values
('Meenakari Sling Bag', 'bags', 1299, 1799, 4.6, 12,
 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
 ARRAY['sling','everyday','handcrafted'],
 'A compact sling with enamel-inspired detailing. Roomy enough for the essentials, light enough for all-day wear.'),

('Jaipur Jacquard Tote', 'bags', 1899, 2499, 4.8, 7,
 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
 ARRAY['tote','work','roomy'],
 'A structured tote in woven jacquard with a brass-tone clasp. Fits a tablet, a bottle, and everything in between.'),

('Kundan Chandbali Earrings', 'earrings', 899, 1299, 4.9, 25,
 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&q=80',
 ARRAY['kundan','festive','statement'],
 'Crescent-shaped chandbalis with kundan work and pearl drops. The one pair that finishes every ethnic look.'),

('Minimal Gold Hoops', 'earrings', 499, null, 4.4, 40,
 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
 ARRAY['hoops','everyday','minimal'],
 'Lightweight brass-tone hoops that go from desk to dinner. Hypoallergenic posts, feather-light feel.'),

('Navratri Oxidised Jhumka Set', 'festive', 749, 999, 4.7, 18,
 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
 ARRAY['navratri','oxidised','jhumka'],
 'Oxidised silver-tone jhumkas with ghungroo drops — made to move when you do the garba.'),

('Mirror-Work Potli Bag', 'festive', 999, 1399, 4.5, 9,
 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
 ARRAY['navratri','potli','mirror'],
 'A drawstring potli with mirror-work embroidery. The perfect festive companion for your lehenga or kurta.'),

('Enamel Floral Hair Clips (Set of 3)', 'hair', 349, null, 4.3, 50,
 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
 ARRAY['clips','everyday','set'],
 'Three enamel floral clips in complementary tones. Strong grip, gentle on hair.'),

('Lac Bangles Stack (Set of 6)', 'bangles', 599, 899, 4.6, 15,
 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
 ARRAY['lac','festive','stack'],
 'A hand-set stack of lac bangles with stonework. Layer them or wear a couple — your call.')
on conflict do nothing;

insert into posts (slug, title, excerpt, cover, author, date, tags, body) values
('styling-jhumkas-for-navratri', '5 Ways to Style Jhumkas for Navratri',
 'From garba nights to the aarti — pair your jhumkas like a pro.',
 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80',
 'Team RnD Muse', '2025-09-18', ARRAY['festive','styling','navratri'],
 '<p>Navratri is nine nights of colour, movement and celebration — and the right jhumkas tie every look together.</p><p>Start with oxidised jhumkas for the garba floor. They''re light, they catch the light, and they move with you.</p><p>For the quieter aarti mornings, switch to smaller studs or a delicate chandbali. Let your outfit lead and keep the earrings soft.</p><p>Mixing metals? Keep your bag hardware in the same tone as your earrings — small detail, big difference.</p>'),

('how-to-care-for-oxidised-jewellery', 'How to Care for Oxidised Jewellery',
 'Keep that antique finish looking rich for years.',
 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80',
 'Team RnD Muse', '2025-08-02', ARRAY['care','jewellery'],
 '<p>Oxidised jewellery has a deliberately antique finish — and a little care keeps it that way.</p><p>Keep it dry. Take earrings off before a shower or a workout, and store them in a zip pouch away from moisture.</p><p>Wipe gently with a soft dry cloth after wearing. Avoid perfume and sanitiser directly on the metal.</p><p>With these habits, your favourite pieces stay rich and dramatic season after season.</p>'),

('one-bag-three-looks', 'One Bag, Three Looks',
 'Why a good sling is the hardest-working thing in your wardrobe.',
 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1000&q=80',
 'Team RnD Muse', '2025-07-11', ARRAY['bags','styling'],
 '<p>The right sling bag quietly earns its place in every outfit.</p><p>For work, keep it structured and neutral so it disappears into a polished look.</p><p>For evenings, a bit of shine or detailing turns the same silhouette into a statement.</p><p>On weekends, go crossbody and hands-free. One bag, three completely different moods.</p>')
on conflict (slug) do nothing;
