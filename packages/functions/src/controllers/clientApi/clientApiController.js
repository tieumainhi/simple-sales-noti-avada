/**
 * Health check endpoint for client API
 * @param ctx
 * @returns {Promise<{success: boolean, timestamp: string}>}
 */
export async function health(ctx) {
  return (ctx.body = {
    success: true,
    timestamp: new Date().toISOString()
  });
}

// Add more client API handlers here
// Example:
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import { getOrCreateSettings } from '@functions/repositories/settingsRepository';
import { getNotifications } from '@functions/repositories/notificationsRepository';

/**
 * Public endpoint for storefronts to fetch settings + recent notifications
 */
export async function getSettingNotifications(ctx) {
  try {
    const { shopifyDomain } = ctx.query;

    const shop = await getShopByShopifyDomain(shopifyDomain);
    if (!shop) {
      ctx.status = 404;
      return (ctx.body = {
        success: false,
        data: { setting: {}, notifications: [] },
        error: 'Shop not found'
      });
    }

    const settings = await getOrCreateSettings(shop.id);

    // Limit number of notifications for client API; default 5
    const limit = parseInt(ctx.query.limit, 10) || 5;
    const notificationsResult = await getNotifications(shop.id, { limit });
    const notifications =
      notificationsResult && notificationsResult.data ? notificationsResult.data : [];

    console.log({ settings, notifications });

    return (ctx.body = {
      success: true,
      data: {
        setting: settings,
        notifications
      }
    });
  } catch (e) {
    console.error('getSettingNotifications error', e);
    ctx.status = 500;
    return (ctx.body = {
      success: false,
      data: { setting: {}, notifications: [] },
      error: e.message
    });
  }
}
