export function renderTemplate(template, variables) {
  let html = template;
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  html = html.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (_, key, content) => {
    return variables[key] ? content : '';
  });
  return html;
}

export function registrationOtpEmail(fullName, otp) {
  return {
    subject: 'Your FloraSmart Registration OTP',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Welcome to FloraSmart!</h2>
      <p>Hi ${fullName},</p>
      <p>Use the OTP below to complete your registration. It expires in 10 minutes.</p>
      <div style="font-size:28px;letter-spacing:6px;font-weight:700;text-align:center;padding:16px;background:#f5f5f5;border-radius:8px;margin:16px 0">${otp}</div>
      <p>If you did not request this, please ignore this email.</p>
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Welcome to FloraSmart!\n\nHi ${fullName},\n\nUse the OTP below to complete your registration. It expires in 10 minutes.\n\n${otp}\n\nIf you did not request this, please ignore this email.\n\nFloraSmart`,
  };
}

export function passwordResetEmail(fullName, resetLink) {
  return {
    subject: 'FloraSmart Password Reset',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Password Reset</h2>
      <p>Hi ${fullName},</p>
      <p>Click the button below to reset your password. The link expires in 1 hour.</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${resetLink}" style="background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Reset Password</a>
      </p>
      <p>If you did not request this, please ignore this email.</p>
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `FloraSmart Password Reset\n\nHi ${fullName},\n\nClick the link below to reset your password. The link expires in 1 hour.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nFloraSmart`,
  };
}

export function orderConfirmationEmail(user, order) {
  return {
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Order Confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
      <p><strong>Total:</strong> ${order.totalAmount} RWF</p>
      <p><strong>Delivery:</strong> ${order.shippingAddress}, ${order.shippingCity}</p>
      <p><strong>Delivery Method:</strong> ${order.deliveryMethod}</p>
      <p>We will notify you when your order status changes.</p>
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Order Confirmed!\n\nHi ${user.name},\n\nYour order ${order.orderNumber} has been placed successfully.\nTotal: ${order.totalAmount} RWF\nDelivery: ${order.shippingAddress}, ${order.shippingCity}\n\nWe will notify you when your order status changes.\n\nFloraSmart`,
  };
}

export function orderStatusEmail(user, order, status, note) {
  return {
    subject: `Order Update - ${order.orderNumber}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Order Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>${order.orderNumber}</strong> status has changed to <strong>${status}</strong>.</p>
      ${note ? `<p>${note}</p>` : ''}
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Order Status Update\n\nHi ${user.name},\n\nYour order ${order.orderNumber} status has changed to ${status}.\n${note ? `\n${note}` : ''}\n\nFloraSmart`,
  };
}

export function deliveryStatusEmail(user, order, delivery, note) {
  return {
    subject: `Delivery Update - ${order.orderNumber}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Delivery Update</h2>
      <p>Hi ${user.name},</p>
      <p>Your delivery for order <strong>${order.orderNumber}</strong> is now: <strong>${delivery.status}</strong>.</p>
      ${note ? `<p>${note}</p>` : ''}
      ${delivery.currentLocation ? `<p>Current location: ${delivery.currentLocation}</p>` : ''}
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Delivery Update\n\nHi ${user.name},\n\nYour delivery for order ${order.orderNumber} is now: ${delivery.status}.\n${note ? `\n${note}` : ''}${delivery.currentLocation ? `\nCurrent location: ${delivery.currentLocation}` : ''}\n\nFloraSmart`,
  };
}

export function lowStockAlertEmail(stockItem) {
  const product = stockItem.product || {};
  return {
    subject: `Low Stock Alert - ${product.name}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#e74c3c">Low Stock Alert</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Product</th><td style="border:1px solid #ddd;padding:8px">${product.name}</td></tr>
        <tr><th style="border:1px solid #ddd;padding:8px;text-align:left">SKU</th><td style="border:1px solid #ddd;padding:8px">${product.sku}</td></tr>
        <tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Available</th><td style="border:1px solid #ddd;padding:8px">${stockItem.availableQuantity ?? stockItem.quantity}</td></tr>
        <tr><th style="border:1px solid #ddd;padding:8px;text-align:left">Threshold</th><td style="border:1px solid #ddd;padding:8px">${stockItem.lowStockThreshold}</td></tr>
      </table>
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Low Stock Alert\n\nProduct: ${product.name}\nSKU: ${product.sku}\nAvailable: ${stockItem.availableQuantity ?? stockItem.quantity}\nThreshold: ${stockItem.lowStockThreshold}\n\nFloraSmart`,
  };
}

export function loyaltyRewardEmail(user, reward, redemption) {
  return {
    subject: 'You earned a reward at FloraSmart!',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">Congratulations!</h2>
      <p>Hi ${user.name},</p>
      <p>You redeemed a reward: <strong>${reward.name}</strong></p>
      ${redemption?.couponCode ? `<p>Use coupon code: <strong>${redemption.couponCode}</strong> on your next order.</p>` : ''}
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `Congratulations!\n\nHi ${user.name},\n\nYou redeemed a reward: ${reward.name}\n${redemption?.couponCode ? `\nUse coupon code: ${redemption.couponCode} on your next order.\n` : ''}\n\nFloraSmart`,
  };
}

export function subscriptionEmail(user, subscription, plan, eventType) {
  const isStarted = eventType === 'STARTED';
  return {
    subject: isStarted ? `Subscription Started - ${plan.name}` : `Subscription Cancelled - ${plan.name}`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:${isStarted ? '#4CAF50' : '#888'}">${isStarted ? 'Subscription Started!' : 'Subscription Cancelled'}</h2>
      <p>Hi ${user.name},</p>
      <p>Your <strong>${plan.name}</strong> subscription has been ${isStarted ? 'started' : 'cancelled'}.</p>
      ${isStarted ? `<p><strong>Billing Cycle:</strong> ${plan.billingCycle}</p>` : ''}
      ${subscription.cancelReason ? `<p>Reason: ${subscription.cancelReason}</p>` : ''}
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `${isStarted ? 'Subscription Started!' : 'Subscription Cancelled'}\n\nHi ${user.name},\n\nYour ${plan.name} subscription has been ${isStarted ? 'started' : 'cancelled'}.\n${isStarted ? `\nBilling Cycle: ${plan.billingCycle}\n` : ''}${subscription.cancelReason ? `\nReason: ${subscription.cancelReason}\n` : ''}\n\nFloraSmart`,
  };
}

export function systemAnnouncementEmail(title, message) {
  return {
    subject: title,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#4CAF50">${title}</h2>
      <p>${message}</p>
      <hr><small style="color:#888">FloraSmart - Your Plant & Flower Shop</small>
    </div>`,
    text: `${title}\n\n${message}\n\nFloraSmart`,
  };
}
