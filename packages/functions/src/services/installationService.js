import { getShopById } from '@functions/repositories/shopRepository';
import { getOrCreateSettings } from '@functions/repositories/settingsRepository';
import {
  createNotification,
  hasNotificationForOrder
} from '@functions/repositories/notificationsRepository';
import { loadGraphQL } from '@functions/helpers/graphql/graphqlHelpers';
import { initShopify } from '@functions/services/shopifyService';
import { mapGraphqlOrderToNotification } from '@functions/services/orderNotificationMapper';
import { registerOrdersCreateWebhook } from '@functions/services/webhookRegistrationService';
import { registerStorefrontScriptTag } from '@functions/services/scriptTagRegistrationService';

const INITIAL_ORDERS_LIMIT = 30;

/**
 * @param {Object} params
 * @param {string} params.shopId
 * @param {string} [params.shopifyDomain]
 * @returns {Promise<{syncedOrders: number}>}
 */
export async function handleAfterInstall({ shopId, shopifyDomain }) {
  if (!shopId) {
    throw new Error('Missing shopId for after install handling');
  }

  const shop = await getShopById(shopId);
  if (!shop?.id) {
    throw new Error(`Shop not found: ${shopId}`);
  }

  console.log('After install shop data:', {
    shopId: shop.id,
    shopifyDomain: shopifyDomain || shop.shopifyDomain
  });

  const settings = await getOrCreateSettings(shopId);
  console.log('After install default settings:', settings);

  let webhook = null;
  try {
    webhook = await registerOrdersCreateWebhook({ shop });
  } catch (e) {
    console.error('Cannot register orders/create webhook after install:', {
      shopifyDomain: shopifyDomain || shop.shopifyDomain,
      statusCode: e.statusCode || e.response?.statusCode,
      message: e.message,
      response: e.response?.body
    });
  }

  let scriptTag = null;
  try {
    scriptTag = await registerStorefrontScriptTag({ shop });
  } catch (e) {
    console.error('Cannot register storefront ScriptTag after install:', {
      shopifyDomain: shopifyDomain || shop.shopifyDomain,
      statusCode: e.statusCode || e.response?.statusCode,
      message: e.message,
      response: e.response?.body
    });
  }

  const syncedOrders = await syncInitialOrderNotifications({
    shop,
    shopDomain: shopifyDomain || shop.shopifyDomain
  });

  return { syncedOrders, webhook, scriptTag };
}

/**
 * @param {Object} params
 * @param {Object} params.shop
 * @param {string} params.shopDomain
 * @returns {Promise<number>}
 */
async function syncInitialOrderNotifications({ shop, shopDomain }) {
  const shopify = initShopify(shop);
  let orders = [];
  try {
    const initialOrdersQuery = loadGraphQL('/order.graphql');
    const response = await shopify.graphql(initialOrdersQuery, {
      limit: INITIAL_ORDERS_LIMIT
    });
    orders = response?.orders?.edges?.map(edge => edge.node).filter(Boolean) || [];
  } catch (e) {
    const statusCode = e.statusCode || e.response?.statusCode;
    console.error('Cannot sync Shopify orders after install:', {
      shopDomain,
      statusCode,
      message: e.message,
      response: e.response?.body
    });

    if (statusCode === 403) {
      console.error(
        'Shopify returned 403 for orders API. Check read_orders scope, reinstall/update app scopes, and enable Protected Customer Data if required.'
      );
    }

    return 0;
  }
  console.log(`After install fetched ${orders.length} Shopify orders for ${shopDomain}`);

  let syncedOrders = 0;

  for (const order of orders) {
    const notificationData = mapGraphqlOrderToNotification(order, shopDomain);
    const shopifyOrderId = notificationData.shopifyOrderId;
    const existed = await hasNotificationForOrder(shop.id, shopifyOrderId);
    if (existed) continue;

    console.log('After install notification data:', notificationData);
    const notificationId = await createNotification(shop.id, notificationData);
    console.log('After install notification created:', notificationId);

    syncedOrders += 1;
  }

  return syncedOrders;
}
