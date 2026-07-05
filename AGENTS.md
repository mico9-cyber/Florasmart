## Goal
- Every product image in the Florasmart seed file accurately matches its name, description, and details
- No image sharing across different products (unless true variants)

## Constraints & Preferences
- Use high-quality professional free stock photos (Pexels CC0)
- Do not change product names, descriptions, prices, or categories

## Results — DONE
- Audited all 41 product image URLs → 9 were HTTP 404, many shared across completely different products
- All 41 products now have unique, purpose-matched Pexels CC0 images (except FS-POT-001 which keeps its unique working Unsplash ID)
- All 41 Pexels IDs verified HTTP 200 via HEAD requests
- `pex(id)` helper function added to both `seed.js` and `ImageWithFallback.jsx` for clean URL generation
- `ImageWithFallback.jsx` fallbacks updated to Pexels

## Mapping
- **Indoor plants**: Monstera (10176334), Snake Plant (17489483), Peace Lily (15783250), Spider Plant (5331924), Boston Fern (2919584), Calathea (8244420), Areca Palm (9041608), Aloe Vera (33202074), Poinsettia (35257723), Frangipani (30130352), Orchid Plant (5030458)
- **Outdoor plants**: Red Rose Bush (36756552), Gardenia (24200646), Hibiscus (8766413), Bougainvillea (29983700), Jasmine (37558227), Bird of Paradise (32554970)
- **Flowers/bouquets**: Premium Rose (1393437), Orchid Arrangement (6207449), Dried Lavender (4997806), Tulip Bouquet (3874607), Sunflower Bouquet (11259478), Mixed Bouquet (1484657)
- **Seeds**: Lavender (6471708), Sunflower Giant (772571), Wildflower Meadow (7813243), Marigold (17892586)
- **Tools**: Pruning Shears (6764325), Garden Trowel (4503269), Copper Watering Can (8894568)
- **Fertilizers**: Organic All-Purpose (25974981), Liquid Seaweed (30801526), Rose & Flower Food (31673795)
- **Decorative**: Garden Gnome (18297345), Solar Fairy Lights (1124960), Wind Chime (9153309)
- **Pots/Vases**: Terracotta Pot Set (1605255), Glass Vase (2543299), Ceramic Vase (6945389), Bud Vase Set (8903350)
- **Ceramic Planter - White** (FS-POT-001): keeps original Unsplash ID `1485955900006-10f4d324d411` (unique, working)

## Key Decisions
- Replace ALL product images with Pexels CC0 (not just the broken 9) to eliminate reuse
- Use `pex(id)` helper instead of raw URLs for maintainability
- Keep FS-POT-001 on its original unique working Unsplash ID

## Relevant Files
- `backend/prisma/seed.js`: all 41 products with `pex(id)` image URLs
- `src/components/ImageWithFallback.jsx`: Pexels-based fallbacks
