import { initShopify } from '@functions/services/shopifyService';

/**
 * Shopify order webhooks include product/variant ids in line_items, but not product images.
 * Fetch the product only when the webhook payload cannot provide an image.
 *
 * @param {Object} params
 * @param {Object} params.shop
 * @param {Object} params.lineItem
 * @returns {Promise<string>}
 */
export async function getProductImageFromLineItem({ shop, lineItem = {} }) {
  const productId = lineItem.product_id;
  if (!productId) return '';

  try {
    const shopify = initShopify(shop);
    const product = await shopify.product.get(productId);

    const variantId = lineItem.variant_id ? String(lineItem.variant_id) : '';
    const variant = variantId
      ? product.variants?.find(item => String(item.id) === variantId)
      : null;

    const variantImageId = variant?.image_id ? String(variant.image_id) : '';
    const variantImage = variantImageId
      ? product.images?.find(image => String(image.id) === variantImageId)
      : null;

    return variantImage?.src || product.image?.src || product.images?.[0]?.src || '';
  } catch (e) {
    console.error('Cannot fetch product image for notification:', {
      productId,
      variantId: lineItem.variant_id,
      message: e.message,
      statusCode: e.statusCode || e.response?.statusCode,
      response: e.response?.body
    });
    return '';
  }
}
