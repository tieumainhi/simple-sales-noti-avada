import { getCurrentShop } from '@functions/helpers/auth';
import { getNotifications } from '@functions/repositories/notificationsRepository';

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<void>}
 */
export async function getList(ctx) {
  try {
    const shopId = getCurrentShop(ctx);
    const result = await getNotifications(shopId, ctx.query);

    ctx.body = { success: true, ...result };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = {
      success: false,
      data: [],
      count: 0,
      pageInfo: {},
      error: e.message
    };
  }
}
