import { getShopInfoByShopId } from '@functions/repositories/shopInfoRepository';
import { getShopById, getShopByShopifyDomain } from '@functions/repositories/shopRepository';

/**
 * @param ctx
 * @returns {Promise<{shop, shopInfo: *}>}
 */
export async function getUserShops(ctx) {
  try {
    let shopId = ctx.state?.user?.shopID;
    if (!shopId && ctx.state?.shopify?.shop) {
      const shopByDomain = await getShopByShopifyDomain(ctx.state.shopify.shop);
      shopId = shopByDomain?.id;
      console.log('Fallback shop lookup by domain:', {
        shopifyDomain: ctx.state.shopify.shop,
        shopId
      });
    }

    if (!shopId) {
      throw new Error('Missing shopId in authenticated request');
    }

    console.log('Get user shops', shopId);
    const [shop, shopInfo] = await Promise.all([getShopById(shopId), getShopInfoByShopId(shopId)]);

    console.log('Got shop info', shopInfo);

    ctx.body = { shop, shopInfo };
  } catch (e) {
    console.error('Get user shops error:', e);
    ctx.status = 500;
    ctx.body = { shop: null, shopInfo: null, error: e.message };
  }
}
