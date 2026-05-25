/**
 * @param {Object} order
 * @param {string} shopDomain
 * @returns {Object}
 */
export function mapGraphqlOrderToNotification(order, shopDomain) {
  const firstLineItem = getFirstGraphqlLineItem(order);

  return buildNotificationData({
    shopDomain,
    shopifyOrderId: getLegacyId(order),
    orderName: order.name,
    productId: getLegacyNumber(firstLineItem.product),
    firstName: order.customer?.firstName || order.billingAddress?.firstName || '',
    city: order.shippingAddress?.city || order.billingAddress?.city || '',
    country: order.shippingAddress?.country || order.billingAddress?.country || '',
    productName: firstLineItem.title || '',
    productImage:
      firstLineItem.product?.featuredImage?.url || firstLineItem.variant?.image?.url || '',
    timestamp: order.createdAt || order.processedAt || new Date()
  });
}

/**
 * @param {Object} order
 * @param {string} shopDomain
 * @returns {Object}
 */
export function mapWebhookOrderToNotification(order, shopDomain) {
  const firstLineItem = order.line_items?.[0] || {};

  return buildNotificationData({
    shopDomain,
    shopifyOrderId: order.id ? String(order.id) : null,
    orderName: order.name,
    productId: firstLineItem.product_id || null,
    firstName: order.customer?.first_name || order.billing_address?.first_name || '',
    city: order.shipping_address?.city || order.billing_address?.city || '',
    country: order.shipping_address?.country || order.billing_address?.country || '',
    productName: firstLineItem.title || firstLineItem.name || '',
    productImage:
      firstLineItem.product_image || firstLineItem.variant_image || firstLineItem.image || '',
    timestamp: order.created_at || order.processed_at || new Date()
  });
}

/**
 * @param {Object} data
 * @returns {Object}
 */
function buildNotificationData(data) {
  return {
    shopDomain: data.shopDomain,
    shopifyOrderId: data.shopifyOrderId,
    orderName: data.orderName || '',
    productId: data.productId || null,
    firstName: data.firstName || '',
    city: data.city || '',
    country: data.country || '',
    productName: data.productName || '',
    productImage: data.productImage || '',
    timestamp: data.timestamp || new Date()
  };
}

/**
 * @param {Object} order
 * @returns {Object}
 */
function getFirstGraphqlLineItem(order) {
  return order.lineItems?.edges?.[0]?.node || {};
}

/**
 * @param {Object} node
 * @returns {string|null}
 */
function getLegacyId(node) {
  if (!node) return null;
  if (node.legacyResourceId) return String(node.legacyResourceId);

  return node.id?.split('/').pop() || null;
}

/**
 * @param {Object} node
 * @returns {number|string|null}
 */
function getLegacyNumber(node) {
  const id = getLegacyId(node);
  if (!id) return null;

  const numericId = Number(id);
  return Number.isSafeInteger(numericId) ? numericId : id;
}
