import { getCurrentShop } from '@functions/helpers/auth';
import { getOrCreateSettings, updateSettings } from '@functions/repositories/settingsRepository';

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<void>}
 */
export async function get(ctx) {
  try {
    const shopId = getCurrentShop(ctx);
    const data = await getOrCreateSettings(shopId);

    ctx.body = { success: true, data };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { success: false, data: {}, error: e.message };
  }
}

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<void>}
 */
export async function update(ctx) {
  try {
    const shopId = getCurrentShop(ctx);
    const data = await updateSettings(shopId, ctx.req.body);

    ctx.body = { success: true, data, message: 'Settings saved' };
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { success: false, error: e.message };
  }
}
