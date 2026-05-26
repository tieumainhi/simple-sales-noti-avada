import {
  createNotification,
  hasNotificationForOrder
} from '@functions/repositories/notificationsRepository';
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import { mapWebhookOrderToNotification } from '@functions/services/orderNotificationMapper';
import { getProductImageFromLineItem } from '@functions/services/productImageService';

/**
 * Handle app/uninstalled webhook
 * @param ctx
 * @returns {Promise<{success: boolean}>}
 */
export async function appUninstalled(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    // TODO: Handle app uninstallation logic here
    // Example: Mark shop as uninstalled, cleanup data, etc.
    console.log(`App uninstalled for shop: ${shopifyDomain}`);

    return (ctx.body = {
      success: true
    });
  } catch (e) {
    console.error(e);
    return (ctx.body = {
      success: false,
      error: e.message
    });
  }
}

/**
 * Handle orders/create webhook
 * @param ctx
 * @returns {Promise<void>}
 */
export async function ordersCreate(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    const order = getWebhookPayload(ctx);

    if (!shopifyDomain) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Missing Shopify shop domain' };
      return;
    }

    if (!order?.id) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'Missing Shopify order payload' };
      return;
    }

    const shop = await getShopByShopifyDomain(shopifyDomain);
    if (!shop?.id) {
      ctx.status = 404;
      ctx.body = { success: false, error: `Shop not found: ${shopifyDomain}` };
      return;
    }

    // Map Shopify order data to notification format
    const notificationData = mapWebhookOrderToNotification(order, shopifyDomain);

    // check if notification for this order already exists to avoid duplicates (e.g. in case of webhook retries)
    const existed = await hasNotificationForOrder(shop.id, notificationData.shopifyOrderId);

    if (existed) {
      ctx.body = { success: true, skipped: true };
      return;
    }

    if (!notificationData.productImage) {
      notificationData.productImage = await getProductImageFromLineItem({
        shop,
        lineItem: order.line_items?.[0]
      });
    }

    // Create notification in the database if it doesn't exist
    const notificationId = await createNotification(shop.id, notificationData);
    console.log('orders/create notification created:', {
      id: notificationId,
      shopifyDomain,
      shopifyOrderId: notificationData.shopifyOrderId
    });

    ctx.body = {
      success: true,
      id: notificationId
    };
  } catch (e) {
    console.error('orders/create webhook error:', e);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: e.message
    };
  }
}

/**
 * @param ctx
 * @returns {Object}
 */
function getWebhookPayload(ctx) {
  if (ctx.req.body && typeof ctx.req.body === 'object') {
    return ctx.req.body;
  }

  if (ctx.request?.body && typeof ctx.request.body === 'object') {
    return ctx.request.body;
  }

  const rawBody = ctx.req.rawBody;
  if (!rawBody) return {};

  const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  return JSON.parse(bodyString);
}
