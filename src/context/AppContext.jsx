import React, { useState, useEffect } from 'react';
import { AppContext } from './AppData';
import { readJson, writeJson } from '../utils/storage';
import { registerUser, loginUser, verifyRegistrationOtp, resendRegistrationOtp } from '../utils/api';

const APP_DATA_VERSION = 'florasmart-v4-ai-advisor-fix';

function migrateStorage() {
  const stored = readJson('flora_app_version', null);
  if (stored !== APP_DATA_VERSION) {
    const keys = ['flora_products', 'flora_cart', 'flora_orders', 'flora_loyalty', 'flora_garden', 'flora_pending_reg', 'flora_user'];
    keys.forEach(k => localStorage.removeItem(k));
    writeJson('flora_app_version', APP_DATA_VERSION);
  }
}

const PHOTO_URL = 'https://images.unsplash.com/photo-';

migrateStorage();

const PC = (id, path) => PHOTO_URL + path + '?w=600&h=600&fit=crop';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Monstera Deliciosa', category: 'plants', price: 35000, rating: 4.8, reviews: 124, stock: 15, isAIRecommended: true, image: PC(1, '1741620979764-54cf622e3d84'), desc: 'A popular indoor plant known for its dramatic split leaves. Adds a tropical feel to any room.', sunlight: 'Indirect Bright Light', water: 'Once a week', toxic: 'Yes (Cats & Dogs)', petSafe: false, purpose: 'Indoor Beauty,Aesthetic Indoor Statement Stems' },
  { id: 2, name: 'Enchanted Rose Bouquet', category: 'flowers', price: 45000, rating: 4.9, reviews: 88, stock: 8, isAIRecommended: false, image: PC(2, '1518709779341-56cf4535e94b'), desc: 'A stunning arrangement of deep red roses and premium foliage, perfect for romantic gestures.', sunlight: 'Indirect Cool Light', water: 'Change water daily', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration,Vibrant' },
  { id: 3, name: 'White Ceramic Cylinder Vase', category: 'vases', price: 15000, rating: 4.6, reviews: 42, stock: 22, isAIRecommended: false, image: PC(3, '1581783898377-1c85bf937427'), desc: 'A sleek, minimalist white ceramic vase that fits medium-to-tall flower arrangements.', height: '25cm', diameter: '10cm', style: 'Modern', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: '' },
  { id: 4, name: 'Snake Plant Laurentii', category: 'plants', price: 15000, rating: 4.7, reviews: 205, stock: 30, isAIRecommended: true, image: PC(4, '1567225557594-88d73e55f2cb'), desc: 'Nearly indestructible air-purifying plant, perfect for beginners and low-light spaces.', sunlight: 'Low to Bright Indirect', water: 'Every 2-3 weeks', toxic: 'Yes (Cats & Dogs)', petSafe: false, purpose: 'Low Maintenance,Air Purification,Indoor Beauty' },
  { id: 5, name: 'Fiddle Leaf Fig', category: 'plants', price: 28000, rating: 4.5, reviews: 67, stock: 12, isAIRecommended: true, image: PC(5, '1643819131782-474a409da244'), desc: 'A statement houseplant featuring large, glossy violin-shaped leaves on sleek woody stems.', sunlight: 'Bright Consistent Light', water: 'When top 2 inches dry', toxic: 'Yes', petSafe: false, purpose: 'Aesthetic Indoor Statement Stems' },
  { id: 6, name: 'Golden Hour Tulip Bundle', category: 'flowers', price: 25000, rating: 4.8, reviews: 54, stock: 10, isAIRecommended: false, image: PC(6, '1547697264-5e639839765e'), desc: 'A bright mix of orange and yellow tulips, bringing warmth and joy to your living spaces.', sunlight: 'Indirect Cool Light', water: 'Replenish cool water', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Vibrant,Flowering Decoration' },
  { id: 7, name: 'Rustic Terracotta Vase', category: 'vases', price: 12000, rating: 4.5, reviews: 31, stock: 14, isAIRecommended: false, image: PC(7, '1742396512765-4067ffe1db72'), desc: 'An earthy, rough-textured terracotta vase crafted by local artisans for a warm rustic aesthetic.', height: '18cm', diameter: '12cm', style: 'Rustic', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: '' },
  { id: 8, name: 'Peace Lily', category: 'plants', price: 18000, rating: 4.7, reviews: 110, stock: 25, isAIRecommended: true, image: PC(8, '1547816999-d99671865dcf'), desc: 'Beautiful dark green foliage offset by elegant white blooms. Excellent for improving air quality.', sunlight: 'Medium to Low Shade', water: 'Keep soil moist', toxic: 'Yes', petSafe: false, purpose: 'Air Purification,Aesthetic Indoor Statement Stems' },
  { id: 9, name: 'Hibiscus Rosa-Sinensis', category: 'plants', price: 25000, rating: 4.6, reviews: 78, stock: 18, isAIRecommended: true, image: PC(9, '1567990989224-6441e1483ac8'), desc: 'Vibrant tropical hibiscus with large crimson blooms. A beloved garden flower in Rwanda.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Vibrant,Flowering Decoration,Outdoor Garden' },
  { id: 10, name: 'Bougainvillea Spectabilis', category: 'plants', price: 20000, rating: 4.5, reviews: 52, stock: 12, isAIRecommended: false, image: PC(10, '1744446499844-5b8b773b23b1'), desc: 'Stunning climbing plant with brilliant magenta bracts. Perfect for garden walls and trellises.', sunlight: 'Full Sun', water: 'Low', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Outdoor Garden' },
  { id: 11, name: 'Frangipani (Plumeria)', category: 'plants', price: 28000, rating: 4.7, reviews: 63, stock: 10, isAIRecommended: false, image: PC(11, '1715899495384-213543e6ed1e'), desc: 'Exquisitely fragrant flowers in pink and white. Thrives in warm climates.', sunlight: 'Full Sun', water: 'Low', toxic: 'Yes', petSafe: false, purpose: 'Low Maintenance,Flowering Decoration' },
  { id: 12, name: 'Jasmine Flowering Plant', category: 'plants', price: 16000, rating: 4.6, reviews: 45, stock: 20, isAIRecommended: false, image: PC(12, '1763227998461-0def27f3de3b'), desc: 'Enchantingly fragrant jasmine blooms that perfume the evening air. Ideal for verandas.', sunlight: 'Full Sun to Partial', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration' },
  { id: 13, name: 'Jacaranda Mimosifolia', category: 'plants', price: 35000, rating: 4.8, reviews: 39, stock: 6, isAIRecommended: false, image: PC(13, '1767173609273-c17423f66ee8'), desc: 'A majestic tree with stunning purple-blue flowers that carpet the ground in bloom.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Outdoor Garden' },
  { id: 14, name: 'Orchid Arrangement', category: 'flowers', price: 55000, rating: 4.9, reviews: 95, stock: 7, isAIRecommended: true, image: PC(14, '1610397648930-477b8c7f0943'), desc: 'Exquisite orchid arrangement featuring vibrant elegant blooms. A sophisticated gift.', sunlight: 'Bright Indirect Light', water: 'Low', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration' },
  { id: 15, name: 'Sunflower Giant', category: 'flowers', price: 3500, rating: 4.4, reviews: 120, stock: 40, isAIRecommended: false, image: PC(15, '1460191269172-12c3ce6e8bfa'), desc: 'Stunning giant sunflowers that bring a touch of summer to any space.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Outdoor Garden' },
  { id: 16, name: 'Calla Lily White', category: 'flowers', price: 22000, rating: 4.7, reviews: 67, stock: 14, isAIRecommended: false, image: PC(16, '1518895949257-7621c3c786d7'), desc: 'Elegant white calla lilies with sleek trumpet-shaped blooms. A symbol of purity and sophistication.', sunlight: 'Partial Shade', water: 'Keep soil moist', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Flowering Decoration' },
  { id: 17, name: 'Gardenia Jasminoides', category: 'plants', price: 18000, rating: 4.6, reviews: 82, stock: 16, isAIRecommended: false, image: PC(17, '1668315005673-f26a5f20a4cd'), desc: 'Fragrant white gardenia flowers with a sweet intoxicating scent.', sunlight: 'Partial Shade', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration' },
  { id: 18, name: 'Aloe Vera', category: 'plants', price: 12000, rating: 4.5, reviews: 150, stock: 25, isAIRecommended: false, image: PC(18, '1613143798921-c342c82c32e2'), desc: 'Versatile succulent with healing properties. Thrives with minimal care.', sunlight: 'Bright Indirect to Direct', water: 'Low', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Low Maintenance,Air Purification' },
  { id: 19, name: 'Bird of Paradise', category: 'plants', price: 35000, rating: 4.8, reviews: 44, stock: 8, isAIRecommended: false, image: PC(19, '1621233575336-fb37d63123d7'), desc: 'Stunning crane-like flowers in orange and blue. A tropical showstopper.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Indoor Beauty,Outdoor Garden' },
  { id: 20, name: 'African Marigold', category: 'flowers', price: 3000, rating: 4.3, reviews: 98, stock: 50, isAIRecommended: false, image: PC(20, '1661142175513-a5f0871f1ad1'), desc: 'Vibrant golden-orange marigolds that bloom abundantly. A garden favorite.', sunlight: 'Full Sun', water: 'Low', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration,Outdoor Garden' },
  { id: 21, name: 'Spider Plant', category: 'plants', price: 14000, rating: 4.8, reviews: 89, stock: 22, isAIRecommended: true, image: PC(21, '1482976311234-a8c1b4d3e5f6'), desc: 'Classic air-purifying plant with arching spiderettes and white variations. Excellent for beginners.', sunlight: 'Bright Indirect Light', water: 'Weekly', toxic: 'No', petSafe: true, purpose: 'Air Purification,Low Maintenance' },
  { id: 22, name: 'Boston Fern', category: 'plants', price: 19000, rating: 4.6, reviews: 76, stock: 18, isAIRecommended: true, image: PC(22, '1692345678901-b2d3e4f5g7h8'), desc: 'Lush, feathery fronds create a tropical atmosphere. Perfect for bathrooms and bright rooms.', sunlight: 'Medium to Low Light', water: 'High', toxic: 'No', petSafe: true, purpose: 'Indoor Beauty,Low Maintenance' },
  { id: 23, name: 'Areca Palm', category: 'plants', price: 32000, rating: 4.7, reviews: 65, stock: 12, isAIRecommended: true, image: PC(23, '1723456789012-c3d4e5f6g7h8'), desc: 'Elegant feathery fronds add grace to any space. Excellent air purifier.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Air Purification,Indoor Beauty' },
  { id: 24, name: 'Calathea Orbifolia', category: 'plants', price: 26000, rating: 4.5, reviews: 58, stock: 14, isAIRecommended: true, image: PC(24, '1754567890123-d4e5f6g7h8i9'), desc: 'Stunning oval leaves with striking patterns. Low-light tolerant with dramatic foliage.', sunlight: 'Bright Indirect Light', water: 'High', toxic: 'No', petSafe: true, purpose: 'Indoor Beauty,Low Maintenance' },
  { id: 25, name: 'Peace Lily', category: 'plants', price: 18000, rating: 4.7, reviews: 110, stock: 25, isAIRecommended: true, image: PC(25, '1547816999-d99671865dcf'), desc: 'Beautiful dark green foliage offset by elegant white blooms. Excellent for improving air quality.', sunlight: 'Medium to Low Shade', water: 'Keep soil moist', toxic: 'Yes', petSafe: false, purpose: 'Air Purification,Aesthetic Indoor Statement Stems' },
  { id: 26, name: 'ZZ Plant', category: 'plants', price: 13000, rating: 4.4, reviews: 95, stock: 28, isAIRecommended: true, image: PC(26, '1800123456789-e5f6g7h8i9j0'), desc: 'Modern, waxy leaves that tolerate neglect. Perfect for offices and low-light rooms.', sunlight: 'Low Light', water: 'Low', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Low Maintenance,Indoor Beauty' },
  { id: 27, name: 'Dracaena Marginata', category: 'plants', price: 16000, rating: 4.6, reviews: 67, stock: 18, isAIRecommended: false, image: PC(27, '1811234567890-f6g7h8i9j0k1'), desc: 'Striking red-edged leaves bring color to any space. Easy to care for.', sunlight: 'Indirect Bright Light', water: 'Moderate', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Low Maintenance' },
  { id: 28, name: 'Boston Fern', category: 'plants', price: 19000, rating: 4.6, reviews: 76, stock: 18, isAIRecommended: true, image: PC(28, '1692345678901-b2d3e4f5g7h8'), desc: 'Lush, feathery fronds create a tropical atmosphere. Perfect for bathrooms and bright rooms.', sunlight: 'Medium to Low Light', water: 'High', toxic: 'No', petSafe: true, purpose: 'Indoor Beauty,Low Maintenance' },
  { id: 29, name: 'Amaryllis', category: 'flowers', price: 28000, rating: 4.8, reviews: 54, stock: 10, isAIRecommended: false, image: PC(29, '1853456789012-g7h8i9j0k1l2'), desc: 'Magnificent trumpet-shaped blooms in red, white, or pink. Perfect for winter color.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Flowering Decoration' },
  { id: 30, name: 'Passionflower', category: 'plants', price: 20000, rating: 4.5, reviews: 43, stock: 15, isAIRecommended: false, image: PC(30, '1914567890123-h8i9j0k1l2m3'), desc: 'Exotic flowers with intricate patterns. Blooms prolifically in warm weather.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'Yes', petSafe: false, purpose: 'Flowering Decoration,Outdoor Garden' },
  { id: 31, name: 'Kalanchoe', category: 'plants', price: 14000, rating: 4.3, reviews: 89, stock: 20, isAIRecommended: true, image: PC(31, '1927678901234-i9j0k1l2m3n4'), desc: 'Succulent rosette with colorful flowers. Thrives with minimal watering.', sunlight: 'Full Sun', water: 'Low', toxic: 'Yes', petSafe: false, purpose: 'Low Maintenance,Flowering Decoration' },
  { id: 32, name: 'Coleus', category: 'plants', price: 12000, rating: 4.4, reviews: 76, stock: 25, isAIRecommended: true, image: PC(32, '1940789012345-j0k1l2m3n4o5'), desc: 'Colorful foliage with interesting patterns. Perfect for brightening shaded areas.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Aesthetic Indoor Statement Stems' },
  { id: 33, name: 'Flowerpot Planter', category: 'vases', price: 8000, rating: 4.3, reviews: 95, stock: 30, isAIRecommended: false, image: PC(33, '1953890123456-k1l2m3n4o5p6'), desc: 'Stylish ceramic flowerpot with drainage. Perfect for indoor and outdoor plants.', height: '15cm', diameter: '12cm', style: 'Modern', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: '' },
  { id: 34, name: 'Hanging Basket', category: 'vases', price: 22000, rating: 4.7, reviews: 63, stock: 12, isAIRecommended: false, image: PC(34, '1966791234567-l2m3n4o5p6q7'), desc: 'Decorative hanging basket for flowers and trailing plants. Elegant display solution.', height: '30cm', diameter: '35cm', style: 'Hanging', sunlight: 'Bright Indirect Light', water: 'High', toxic: 'No', petSafe: true, purpose: '' },
  { id: 35, name: 'Bamboo Palm', category: 'plants', price: 28000, rating: 4.6, reviews: 67, stock: 10, isAIRecommended: false, image: PC(35, '1979892345678-m3n4o5p6q7r8'), desc: 'Elegant palm fronds add tropical elegance. Excellent air purifier.', sunlight: 'Bright Indirect Light', water: 'High', toxic: 'No', petSafe: true, purpose: 'Air Purification,Indoor Beauty' },
  { id: 36, name: 'Anthurium', category: 'flowers', price: 25000, rating: 4.5, reviews: 68, stock: 15, isAIRecommended: false, image: PC(36, '1992993456789-n4o5p6q7r8s9'), desc: 'Vibrant red heart-shaped blooms that last for weeks. Perfect for gifts.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Flowering Decoration' },
  { id: 37, name: 'Umbrella Plant', category: 'plants', price: 18000, rating: 4.5, reviews: 83, stock: 18, isAIRecommended: false, image: PC(37, '2006094567890-o5p6q7r8s9t0'), desc: 'Large, glossy leaves resemble umbrellas. Perfect for filtering harsh light.', sunlight: 'Bright Indirect Light', water: 'High', toxic: 'No', petSafe: true, purpose: 'Indoor Beauty,Low Maintenance' },
  { id: 38, name: 'Echeveria', category: 'plants', price: 10000, rating: 4.3, reviews: 92, stock: 40, isAIRecommended: true, image: PC(38, '2019195678901-p6q7r8s9t0u1'), desc: 'Rosette-forming succulent with colorful leaves. Thrives with minimal water.', sunlight: 'Bright Direct Light', water: 'Low', toxic: 'Yes', petSafe: false, purpose: 'Low Maintenance,Indoor Beauty' },
  { id: 39, name: 'Crown of Thorns', category: 'plants', price: 12000, rating: 4.4, reviews: 85, stock: 22, isAIRecommended: false, image: PC(39, '2032296789012-q7r8s9t0u1v2'), desc: 'Hardy succulent with spiny stems and colorful flowers. Low-maintenance option.', sunlight: 'Full Sun', water: 'Low', toxic: 'Yes', petSafe: false, purpose: 'Low Maintenance,Flowering Decoration' },
  { id: 40, name: 'Pothos', category: 'plants', price: 8000, rating: 4.3, reviews: 118, stock: 35, isAIRecommended: true, image: PC(40, '2045397890123-r8s9t0u1v2w3'), desc: 'Hardy trailing vine perfect for beginners. Excellent for air purification.', sunlight: 'Low to Bright Indirect', water: 'Low', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Air Purification,Low Maintenance' },
  { id: 41, name: 'Cast Iron Plant', category: 'plants', price: 16000, rating: 4.4, reviews: 76, stock: 20, isAIRecommended: false, image: PC(41, '2058498901234-s9t0u1v2w3x4'), desc: 'Nearly indestructible plant. Perfect for beginners and dark corners.', sunlight: 'Low Light', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Low Maintenance,Indoor Beauty' },
  { id: 42, name: 'Paperwhite Bulb', category: 'flowers', price: 9000, rating: 4.2, reviews: 95, stock: 45, isAIRecommended: false, image: PC(42, '2071599012345-t0u1v2w3x4y5'), desc: 'Fragrant white blooms that grow quickly indoors. Perfect for winter.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Flowering Decoration' },
  { id: 43, name: 'Petunias', category: 'flowers', price: 11000, rating: 4.3, reviews: 88, stock: 30, isAIRecommended: false, image: PC(43, '2084600123456-u1v2w3x4y5z6'), desc: 'Colorful trumpet-shaped flowers. Great for balconies and hanging baskets.', sunlight: 'Full Sun', water: 'Moderate', toxic: 'No', petSafe: true, purpose: 'Flowering Decoration,Outdoor Garden' },
  { id: 44, name: 'Grundleaf', category: 'plants', price: 15000, rating: 4.5, reviews: 63, stock: 18, isAIRecommended: false, image: PC(44, '2097701234567-v2w3x4y5z6a7'), desc: 'Elegant trailing plant with glossy leaves. Perfect for hanging displays.', sunlight: 'Bright Indirect Light', water: 'Moderate', toxic: 'Yes (Pets)', petSafe: false, purpose: 'Aesthetic Indoor Statement Stems' },
  { id: 45, name: 'Peace Lily', category: 'plants', price: 18000, rating: 4.7, reviews: 110, stock: 25, isAIRecommended: true, image: PC(45, '1547816999-d99671865dcf'), desc: 'Beautiful dark green foliage offset by elegant white blooms. Excellent for improving air quality.', sunlight: 'Medium to Low Shade', water: 'Keep soil moist', toxic: 'Yes', petSafe: false, purpose: 'Air Purification,Aesthetic Indoor Statement Stems' },
];

const DEMO_USERS = [
  { name: 'Darrly Garden', role: 'customer', email: 'darrly@florasmart.com', password: 'demo123' },
  { name: 'Flora Studio', role: 'florist', email: 'florist@florasmart.com', password: 'demo123' },
  { name: 'Green Keeper', role: 'gardener', email: 'gardener@florasmart.com', password: 'demo123' },
  { name: 'Admin Operator', role: 'admin', email: 'admin@florasmart.com', password: 'demo123' },
];

const DEFAULT_USER = { name: '', role: 'customer', loggedIn: false, email: '' };

const DEFAULT_ORDERS = [
  {
    id: 'FL-9082',
    date: '2026-06-22',
    items: [
      { id: 1, name: 'Monstera Deliciosa', quantity: 1, price: 35000 },
      { id: 3, name: 'White Ceramic Cylinder Vase', quantity: 1, price: 15000 }
    ],
    total: 50000,
    status: 'Preparing Arrangement',
    address: '123 Canopy Road, Moss Town',
    deliveryMethod: 'Standard Green Delivery',
    trackingNumber: 'TRK-MONSTERA-9082',
    estimatedDelivery: '2026-06-25'
  },
  {
    id: 'FL-8104',
    date: '2026-06-15',
    items: [
      { id: 8, name: 'Peace Lily', quantity: 2, price: 18000 }
    ],
    total: 36000,
    status: 'Delivered',
    address: '123 Canopy Road, Moss Town',
    deliveryMethod: 'Express Eco-Courier',
    trackingNumber: 'TRK-PEACE-8104',
    estimatedDelivery: '2026-06-17'
  }
];

const DEFAULT_LOYALTY = {
  points: 450,
  tier: 'Gold Leaf',
  pointsToNextTier: 50,
  nextReward: 'Free RWF 10,000 voucher',
  isSubscribed: true,
  subscriptionPlan: 'Weekly Green Refresh',
  subscriptionPrice: 30000,
  nextBillingDate: '2026-07-01'
};

const DEFAULT_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-06-24 11:15:30', user: 'darrly@florasmart.com', action: 'User Sign In', ipAddress: '192.168.1.45', status: 'Success' },
  { id: 2, timestamp: '2026-06-24 10:45:12', user: 'darrly@florasmart.com', action: 'Role Switched to Customer', ipAddress: '192.168.1.45', status: 'Success' },
  { id: 3, timestamp: '2026-06-23 15:20:00', user: 'florist@florasmart.com', action: 'Inventory Stock Update', ipAddress: '192.168.1.12', status: 'Success' },
  { id: 4, timestamp: '2026-06-23 09:12:05', user: 'admin@florasmart.com', action: 'Database Backup Completed', ipAddress: '10.0.0.8', status: 'Success' },
];

const createDefaultGarden = () => Array(64).fill(null).map((_, idx) => {
  if (idx === 10) return { name: 'Monstera', color: '#22C55E', emoji: '🌿', datePlanted: '2026-06-10' };
  if (idx === 18) return { name: 'Rose', color: '#EF4444', emoji: '🌹', datePlanted: '2026-06-12' };
  if (idx === 29) return { name: 'Tulip', color: '#F59E0B', emoji: '🌷', datePlanted: '2026-06-20' };
  return null;
});

export const AppProvider = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState(() => readJson('flora_registered_users', DEMO_USERS));
  const [user, setUser] = useState(() => readJson('flora_user', DEFAULT_USER));
  const [cart, setCart] = useState(() => readJson('flora_cart', []));
  const [products, setProducts] = useState(() => readJson('flora_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => readJson('flora_orders', DEFAULT_ORDERS));
  const [loyalty, setLoyalty] = useState(() => readJson('flora_loyalty', DEFAULT_LOYALTY));
  const [auditLogs, setAuditLogs] = useState(() => readJson('flora_audit', DEFAULT_AUDIT_LOGS));
  const [gardenLayout, setGardenLayout] = useState(() => readJson('flora_garden', createDefaultGarden()));

  useEffect(() => writeJson('flora_registered_users', registeredUsers), [registeredUsers]);
  useEffect(() => writeJson('flora_user', user), [user]);
  useEffect(() => writeJson('flora_cart', cart), [cart]);
  useEffect(() => writeJson('flora_products', products), [products]);
  useEffect(() => writeJson('flora_orders', orders), [orders]);
  useEffect(() => writeJson('flora_loyalty', loyalty), [loyalty]);
  useEffect(() => writeJson('flora_audit', auditLogs), [auditLogs]);
  useEffect(() => writeJson('flora_garden', gardenLayout), [gardenLayout]);

  const addAuditLog = (action) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: user.loggedIn ? user.email : 'Anonymous',
      action,
      ipAddress: '192.168.1.45',
      status: action.startsWith('Failed') ? 'Failure' : 'Success'
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const addToCart = (product, quantity = 1) => {
    const currentProduct = products.find((item) => item.id === product.id);
    const maxStock = currentProduct?.stock ?? product.stock ?? 0;
    if (maxStock <= 0) return { ok: false, error: `${product.name} is out of stock.` };

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((item) => item.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { ...product, quantity: Math.min(quantity, maxStock) }];
    });
    addAuditLog(`Item Added to Cart: ${product.name} (Qty: ${quantity})`);
    return { ok: true };
  };

  const removeFromCart = (productId) => {
    const item = cart.find((cartItem) => cartItem.id === productId);
    setCart((prev) => prev.filter((cartItem) => cartItem.id !== productId));
    if (item) addAuditLog(`Item Removed from Cart: ${item.name}`);
  };

  const updateCartQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const currentProduct = products.find((item) => item.id === productId);
    const cappedQty = Math.min(qty, currentProduct?.stock ?? qty);
    setCart((prev) => prev.map((item) => item.id === productId ? { ...item, quantity: cappedQty } : item));
  };

  const clearCart = () => setCart([]);

  const [pendingRegistration, setPendingRegistration] = useState(() => readJson('flora_pending_reg', null));

  useEffect(() => writeJson('flora_pending_reg', pendingRegistration), [pendingRegistration]);

  const handleLogin = async (email, password, selectedRole = 'customer') => {
    try {
      const data = await loginUser({ email, password, role: selectedRole });
      const userData = data.data.user;
      setUser({
        name: userData.fullName,
        role: selectedRole,
        loggedIn: true,
        email: userData.email,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      addAuditLog(`User Login: ${selectedRole}`);
      return { ok: true, role: selectedRole };
    } catch (err) {
      const found = registeredUsers.find((item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.role === selectedRole
      );
      if (found) {
        setUser({ name: found.name, role: found.role, loggedIn: true, email: found.email });
        addAuditLog(`User Login (offline): ${found.role}`);
        return { ok: true, role: found.role };
      }
      addAuditLog(`Failed User Login: ${email}`);
      return { ok: false, error: err.message };
    }
  };

  const handleRegister = async (email, password, name, selectedRole) => {
    try {
      await registerUser({
        fullName: name, email, password, role: selectedRole.toUpperCase(),
        phone: '', address: '',
      });
      setPendingRegistration({ email, name, role: selectedRole });
      addAuditLog(`User Registration: ${selectedRole}`);
      return { ok: true, requiresOtp: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      const data = await verifyRegistrationOtp({ email, otp });
      const userData = data.data.user;
      const pending = pendingRegistration;
      setPendingRegistration(null);
      setUser({
        name: userData.fullName,
        role: pending?.role || 'customer',
        loggedIn: true,
        email: userData.email,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      addAuditLog(`User Verified OTP: ${email}`);
      return { ok: true, role: pending?.role || 'customer' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleResendOtp = async (email) => {
    try {
      await resendRegistrationOtp({ email });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleLogout = () => {
    setUser(DEFAULT_USER);
    clearCart();
    addAuditLog('User Logout');
  };

  const switchRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
    addAuditLog(`Role Changed: ${user.role} to ${newRole}`);
  };

  const updateUserProfile = ({ name, email, password }) => {
    if (email !== user.email) {
      const emailExists = registeredUsers.some((item) => item.email.toLowerCase() === email.toLowerCase());
      if (emailExists) return { ok: false, error: 'That email is already assigned to another demo account.' };
    }

    setRegisteredUsers((prev) => prev.map((item) =>
      item.email === user.email ? { ...item, name, email, password: password || item.password } : item
    ));
    setUser((prev) => ({ ...prev, name, email }));
    addAuditLog(`User Profile Updated: ${name}`);
    return { ok: true };
  };

  const updateProductStock = (productId, newStock) => {
    const normalizedStock = Math.max(0, Number(newStock) || 0);
    setProducts((prev) => prev.map((product) => product.id === productId ? { ...product, stock: normalizedStock } : product));
    setCart((prev) => prev
      .map((item) => item.id === productId ? { ...item, quantity: Math.min(item.quantity, normalizedStock) } : item)
      .filter((item) => item.quantity > 0)
    );
    const product = products.find((item) => item.id === productId);
    if (product) addAuditLog(`Inventory Stock Update: ${product.name} to ${normalizedStock}`);
  };

  const addProduct = (productDetails) => {
    const newProduct = {
      id: Date.now(),
      rating: 5.0,
      reviews: 0,
      image: productDetails.image || '',
      isAIRecommended: false,
      desc: 'Custom inventory item added by studio operator.',
      ...productDetails,
      price: Number(productDetails.price),
      stock: Math.max(0, Number(productDetails.stock) || 0),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog(`New Inventory Product Added: ${newProduct.name} (Qty: ${newProduct.stock})`);
    return newProduct;
  };

  const updateProduct = (productId, updates) => {
    setProducts((prev) => prev.map((product) =>
      product.id === productId
        ? {
            ...product,
            ...updates,
            price: updates.price === undefined ? product.price : Number(updates.price),
            stock: updates.stock === undefined ? product.stock : Math.max(0, Number(updates.stock) || 0),
          }
        : product
    ));
    addAuditLog(`Inventory Product Updated: ${productId}`);
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addAuditLog(`Inventory Item Deleted: ${productId}`);
  };

  const createOrder = (orderDetails) => {
    if (cart.length === 0) return { ok: false, error: 'Your cart is empty.' };

    const unavailableItem = cart.find((item) => {
      const product = products.find((current) => current.id === item.id);
      return !product || product.stock < item.quantity;
    });
    if (unavailableItem) {
      return { ok: false, error: `${unavailableItem.name} is no longer available in the requested quantity.` };
    }

    const newOrder = {
      id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      items: cart.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      total: orderDetails.total,
      status: 'Order Placed',
      address: orderDetails.address,
      deliveryMethod: orderDetails.deliveryMethod,
      trackingNumber: `TRK-FL-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    };

    setOrders((prev) => [newOrder, ...prev]);
    setProducts((prev) => prev.map((product) => {
      const orderedItem = cart.find((item) => item.id === product.id);
      return orderedItem ? { ...product, stock: Math.max(0, product.stock - orderedItem.quantity) } : product;
    }));
    clearCart();

    const pointsGained = Math.round(orderDetails.total * 10);
    setLoyalty((prev) => {
      const totalPoints = prev.points + pointsGained;
      return {
        ...prev,
        points: totalPoints,
        pointsToNextTier: Math.max(0, 500 - totalPoints),
        tier: totalPoints >= 500 ? 'Gold Leaf' : totalPoints >= 200 ? 'Silver Bud' : 'Bronze Seedling'
      };
    });

    addAuditLog(`Order Created: ${newOrder.id}, Total: RWF ${Number(orderDetails.total).toLocaleString()}`);
    return { ok: true, orderId: newOrder.id };
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: newStatus } : order));
    addAuditLog(`Order Status Update: ${orderId} set to ${newStatus}`);
  };

  const updateSubscription = (subscribe, planName = '', price = 0) => {
    setLoyalty((prev) => ({
      ...prev,
      isSubscribed: subscribe,
      subscriptionPlan: subscribe ? planName : '',
      subscriptionPrice: subscribe ? price : 0,
      nextBillingDate: subscribe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10) : ''
    }));
    addAuditLog(subscribe ? `Subscribed to ${planName}` : 'Cancelled subscription');
  };

  const updateGardenCell = (index, plantInfo) => {
    setGardenLayout((prev) => {
      const nextGrid = [...prev];
      nextGrid[index] = plantInfo;
      return nextGrid;
    });
    addAuditLog(plantInfo ? `Garden Grid Edit: planted ${plantInfo.name} at ${index}` : `Garden Grid Edit: cleared ${index}`);
  };

  const readTheme = () => {
    try {
      const saved = readJson('flora_theme', 'dark');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  };

  const [theme, setThemeState] = useState(readTheme);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      writeJson('flora_theme', next);
      return next;
    });
  };

  const setTheme = (t) => {
    const next = t === 'light' ? 'light' : 'dark';
    setThemeState(next);
    writeJson('flora_theme', next);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        registeredUsers,
        pendingRegistration,
        cart,
        products,
        orders,
        loyalty,
        auditLogs,
        gardenLayout,
        theme,
        toggleTheme,
        setTheme,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        handleLogin,
        handleRegister,
        handleVerifyOtp,
        handleResendOtp,
        handleLogout,
        switchRole,
        updateUserProfile,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        updateSubscription,
        updateGardenCell,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

