import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages';
const COMPONENTS_DIR = 'src/components';

const replacements = {
  // Generic
  'Loading...': "{t('common.loading')}",
  'Something went wrong.': "{t('common.error')}",
  'No data available.': "{t('common.noData')}",
  'No results found': "{t('common.noResults')}",
  'View All': "{t('common.viewAll')}",

  // Shopping Cart
  'Your Shopping Cart': "{t('cart.title')}",
  'Review your items, adjust quantities, and proceed to checkout.': "{t('cart.subtitle')}",
  'Your Cart is Empty': "{t('cart.empty')}",
  "It looks like you haven't added any plants or vases to your greenhouse cart yet.": "{t('cart.emptyText')}",
  'Browse Shop Items': "{t('cart.browseShop')}",
  'Continue Shopping': "{t('cart.continueShopping')}",
  'Clear Cart': "{t('cart.clearCart')}",
  'Cart Summary': "{t('cart.cartSummary')}",
  'Green Delivery': "{t('cart.greenDelivery')}",
  'Estimated Tax (8%)': "{t('cart.estimatedTax')}",
  'Grand Total': "{t('cart.grandTotal')}",
  'Proceed to Checkout': "{t('cart.proceedCheckout')}",
  'Checkout is secured with RBAC encryption.': "{t('cart.securedCheckout')}",
  'Cart quantity updated.': "{t('cart.quantityUpdated')}",
  'Item removed from cart.': "{t('cart.itemRemoved')}",
  'Cart cleared.': "{t('cart.cartCleared')}",
  'Maximum available quantity reached': "{t('cart.maxReached')}",
  'Out of Stock': "{t('cart.outOfStock')}",

  // Checkout
  'Secure Checkout': "{t('checkout.title')}",
  'Enter your delivery and billing credentials to complete purchase.': "{t('checkout.subtitle')}",
  'Shipping Destination': "{t('checkout.shippingDestination')}",
  'Recipient Name': "{t('checkout.recipientName')}",
  'Street address': "{t('checkout.streetAddress')}",
  'ZIP code': "{t('checkout.zipCode')}",
  'Phone number': "{t('checkout.phoneNumber')}",
  'Delivery Method': "{t('checkout.deliveryMethod')}",
  'Standard Green Delivery': "{t('checkout.standardDelivery')}",
  'Express Eco-Courier': "{t('checkout.expressDelivery')}",
  'Payment Details': "{t('checkout.paymentDetails')}",
  'Card number': "{t('checkout.cardNumber')}",
  'Order Summary': "{t('checkout.orderSummary')}",
  'Place Order': "{t('checkout.placeOrder')}",
  'Processing your order...': "{t('checkout.processing')}",
  'Order placed successfully!': "{t('checkout.orderSuccess')}",
  'Failed to place order.': "{t('checkout.orderFailed')}",

  // Shop
  'Product Catalog': "{t('shop.title')}",
  'All Categories': "{t('shop.allCategories')}",
  'No products found.': "{t('shop.noProducts')}",
  'Try adjusting your search or filter criteria.': "{t('shop.tryAdjusting')}",
  'Add to Cart': "{t('shop.addToCart')}",
  'View Details': "{t('shop.viewDetails')}",
  'In Stock': "{t('shop.inStock')}",

  // Product
  'Product Details': "{t('product.details')}",
  'Care Tips': "{t('product.careTips')}",

  // Orders
  'My Orders': "{t('orders.title')}",
  'No orders yet.': "{t('orders.noOrders')}",
  'Track Delivery': "{t('orders.trackDelivery')}",

  // Profile
  'My Profile': "{t('profile.title')}",
  'Edit Profile': "{t('profile.editProfile')}",
  'Save Changes': "{t('profile.saveChanges')}",
  'Preferred Language': "{t('profile.language')}",
  'Gardening Experience': "{t('profile.experience')}",
  'Garden Space Type': "{t('profile.gardenType')}",
  'Profile updated successfully!': "{t('profile.profileUpdated')}",

  // Notifications
  'Notifications': "{t('notifications.title')}",
  'Mark all as read': "{t('notifications.markAllRead')}",
  'Clear all': "{t('notifications.clearAll')}",
  'No notifications yet.': "{t('notifications.noNotifications')}",

  // Chatbot
  'Care Bot': "{t('chatbot.title')}",
  'Ask about plant care, watering, soil, and more.': "{t('chatbot.subtitle')}",
  'Send': "{t('chatbot.send')}",
  'New Chat': "{t('chatbot.newChat')}",
  'History': "{t('chatbot.history')}",
  'Clear History': "{t('chatbot.clearHistory')}",
  'Conversations': "{t('chatbot.conversations')}",
  'Thinking...': "{t('chatbot.thinking')}",

  // Recommendations
  'AI Plant Advisor': "{t('recommendations.title')}",
  'Get personalized plant recommendations based on your preferences.': "{t('recommendations.subtitle')}",
  'Light Level': "{t('recommendations.lightLevel')}",
  'Watering Frequency': "{t('recommendations.wateringFreq')}",
  'Pet Safe': "{t('recommendations.petSafe')}",
  'Experience Level': "{t('recommendations.experience')}",
  'Get Recommendations': "{t('recommendations.getRecommendations')}",
  'Recommended Plants': "{t('recommendations.results')}",
  'No matching plants found.': "{t('recommendations.noResults')}",
  'Match Score': "{t('recommendations.matchScore')}",

  // Consultation
  'Book a Consultation': "{t('consultation.book.title')}",
  'Schedule a session with one of our expert gardeners.': "{t('consultation.book.subtitle')}",
  'Choose Date': "{t('consultation.book.chooseDate')}",
  'Choose Time': "{t('consultation.book.chooseTime')}",
  'Additional Notes': "{t('consultation.book.notes')}",
  'Book Now': "{t('consultation.book.bookNow')}",
  'Manage Consultations': "{t('consultation.manage.title')}",
  'View and manage your scheduled consultations.': "{t('consultation.manage.subtitle')}",
  'No consultations scheduled.': "{t('consultation.manage.noConsultations')}",
  'Mark Complete': "{t('consultation.manage.complete')}",

  // Admin Users
  'Staff Accounts': "{t('admin.users.title')}",
  'Manage florist and gardener accounts.': "{t('admin.users.subtitle')}",
  'Filter by role': "{t('admin.users.filterRole')}",
  'All Roles': "{t('admin.users.allRoles')}",
  'No users found.': "{t('admin.users.noUsers')}",

  // Inventory
  'Inventory Management': "{t('inventory.title')}",
  'Track and manage product stock levels.': "{t('inventory.subtitle')}",
  'Add Stock': "{t('inventory.addStock')}",
  'No inventory data available.': "{t('inventory.noInventory')}",

  // Analytics
  'Analytics Dashboard': "{t('analytics.title')}",
  'Business insights and performance metrics.': "{t('analytics.subtitle')}",
  'Revenue': "{t('analytics.revenue')}",
  'Total Orders': "{t('analytics.totalOrders')}",
  'Export Data': "{t('analytics.exportData')}",
  'No analytics data available.': "{t('analytics.noData')}",

  // Reports
  'Generate and download business reports.': "{t('reports.subtitle')}",
  'Generate Report': "{t('reports.generateReport')}",
  'Download Report': "{t('reports.downloadReport')}",
  'No reports generated yet.': "{t('reports.noReports')}",

  // Delivery
  'Delivery Management': "{t('delivery.title')}",
  'Track and manage deliveries.': "{t('delivery.subtitle')}",
  'No deliveries found.': "{t('delivery.noDeliveries')}",

  // Garden Planner
  '3D Garden Grid Planner': "{t('gardenPlanner.title')}",
  'Plan your garden layout interactively.': "{t('gardenPlanner.subtitle')}",
  'Save Layout': "{t('gardenPlanner.saveLayout')}",
  'Clear Grid': "{t('gardenPlanner.clearGrid')}",

  // Vase Matching
  'Vase & Floral Matcher': "{t('vaseMatching.title')}",
  'Find the perfect vase for your bouquet.': "{t('vaseMatching.subtitle')}",
  'No matching vases found.': "{t('vaseMatching.noResults')}",

  // Legal
  'Legal Information': "{t('legal.title')}",
  'Privacy Policy': "{t('legal.privacyPolicy')}",
  'Terms of Service': "{t('legal.termsOfService')}",

  // Security
  'Security Settings': "{t('security.title')}",

  // Dashboard
  'Your garden hub at a glance.': "{t('dashboard.customer.subtitle')}",
  'Total Products': "{t('dashboard.florist.totalProducts')}",
  'Pending Orders': "{t('dashboard.florist.pendingOrders')}",
  'Manage orders, inventory, and customers.': "{t('dashboard.florist.subtitle')}",
  'Manage consultations and help customers.': "{t('dashboard.gardener.subtitle')}",
  'No consultations yet.': "{t('dashboard.gardener.noConsultations')}",
  'System overview and management.': "{t('dashboard.admin.subtitle')}",
  'Total Users': "{t('dashboard.admin.totalUsers')}",
  'Active Orders': "{t('dashboard.admin.activeOrders')}",
  'Total Revenue': "{t('dashboard.florist.totalRevenue')}",
  'System Health': "{t('dashboard.admin.systemHealth')}",
  'Recent Activity': "{t('dashboard.admin.recentActivity')}",
  'Manage Users': "{t('dashboard.admin.manageUsers')}",
  'View Reports': "{t('dashboard.admin.viewReports')}",
  'Manage Inventory': "{t('dashboard.admin.manageInventory')}",
  'Analytics': "{t('dashboard.admin.analytics')}",
  'Quick Actions': "{t('dashboard.customer.quickActions')}",
  'Shop Now': "{t('dashboard.customer.shopNow')}",
  'Track Orders': "{t('dashboard.customer.trackOrders')}",
  'Ask AI Advisor': "{t('dashboard.customer.askAI')}",
  'Book Consultation': "{t('dashboard.customer.bookConsult')}",
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add useTranslation import if not present
  if (!content.includes("from 'react-i18next'")) {
    // Find last import line
    const importRegex = /^import .+$/gm;
    let lastImportEnd = 0;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportEnd = match.index + match[0].length;
    }
    if (lastImportEnd > 0) {
      content = content.slice(0, lastImportEnd) + "\nimport { useTranslation } from 'react-i18next';" + content.slice(lastImportEnd);
      modified = true;
    }
  }

  // Add const { t } = useTranslation(); if not present
  if (!content.includes('useTranslation()') && content.includes("from 'react-i18next'")) {
    // Find function body opening
    const funcMatch = content.match(/(?:export default function|function) \w+\([^)]*\)\s*\{/);
    if (funcMatch) {
      const insertAt = funcMatch.index + funcMatch[0].length;
      content = content.slice(0, insertAt) + "\n  const { t } = useTranslation();" + content.slice(insertAt);
      modified = true;
    }
  }

  // Apply replacements
  for (const [original, replacement] of Object.entries(replacements)) {
    // Only replace in JSX text content (not in strings, attributes, etc.)
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match in JSX text (between > and <) or as string literal
    const jsxRegex = new RegExp(`(?<=>)[\\s]*${escapedOriginal}[\\s]*(?=<)`, 'g');
    const newContent = content.replace(jsxRegex, (m) => m.replace(original, `{${replacement.replace(/^\{(.+)\}$/, '$1')}}`));
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }

    // Also match string props like title="..." or placeholder="..."
    const attrRegex = new RegExp(`((?:title|placeholder|label)={[^}]*?")${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(")`, 'g');
    const newContent2 = content.replace(attrRegex, `$1{${replacement.replace(/^\{(.+)\}$/, '$1')}}$2`);
    if (newContent2 !== content) {
      content = newContent2;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`Skipped (no changes): ${filePath}`);
  }
}

// Process all page files
const pageFiles = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.jsx'));
for (const file of pageFiles) {
  processFile(path.join(PAGES_DIR, file));
}

// Process component files
const compFiles = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.jsx'));
for (const file of compFiles) {
  processFile(path.join(COMPONENTS_DIR, file));
}

console.log('\nDone!');
