import appConfig from '@functions/config/app';
import { initShopify } from '@functions/services/shopifyService';

const SCRIPT_TAG_SRC_PATH = '/scripttag/avada-storefront.min.js';

/**
 * @param {Object} params
 * @param {Object} params.shop
 * @returns {Promise<{id: number|null, src: string, action: string}>}
 */
export async function registerStorefrontScriptTag({ shop }) {
  const shopify = initShopify(shop);
  const src = getStorefrontScriptTagSrc(shop.shopifyDomain);

  if (!src) {
    console.error('Cannot register storefront ScriptTag because APP_BASE_URL is missing');
    return { id: null, src: '', action: 'skipped' };
  }

  const scriptTags = await shopify.scriptTag.list();
  const exactScriptTag = scriptTags.find(scriptTag => scriptTag.src === src);

  if (exactScriptTag) {
    console.log('storefront ScriptTag already registered:', {
      id: exactScriptTag.id,
      src
    });
    return { id: exactScriptTag.id, src, action: 'exists' };
  }

  const sameAppScriptTags = scriptTags.filter(scriptTag =>
    scriptTag.src?.includes(SCRIPT_TAG_SRC_PATH)
  );
  const sameAppScriptTag = sameAppScriptTags[0];

  if (sameAppScriptTag?.id) {
    const updated = await shopify.scriptTag.update(sameAppScriptTag.id, {
      event: 'onload',
      src,
      display_scope: 'all'
    });

    await deleteDuplicateScriptTags(shopify, sameAppScriptTags.slice(1));

    console.log('storefront ScriptTag updated:', {
      id: updated.id,
      src
    });
    return { id: updated.id, src, action: 'updated' };
  }

  const created = await shopify.scriptTag.create({
    event: 'onload',
    src,
    display_scope: 'all'
  });

  console.log('storefront ScriptTag registered:', {
    id: created.id,
    src
  });
  return { id: created.id, src, action: 'created' };
}

/**
 * @returns {string}
 */
function getStorefrontScriptTagSrc(shopifyDomain) {
  if (!appConfig.baseUrl) return '';

  const baseUrl = appConfig.baseUrl.startsWith('http')
    ? appConfig.baseUrl
    : `https://${appConfig.baseUrl}`;

  return `${baseUrl.replace(/\/$/, '')}${SCRIPT_TAG_SRC_PATH}?shop=${encodeURIComponent(
    shopifyDomain || ''
  )}`;
}

/**
 * @param {Shopify} shopify
 * @param {Array<{id: number, src: string}>} scriptTags
 * @returns {Promise<void>}
 */
async function deleteDuplicateScriptTags(shopify, scriptTags) {
  await Promise.all(
    scriptTags.map(async scriptTag => {
      try {
        await shopify.scriptTag.delete(scriptTag.id);
        console.log('duplicate storefront ScriptTag deleted:', {
          id: scriptTag.id,
          src: scriptTag.src
        });
      } catch (e) {
        console.error('Cannot delete duplicate storefront ScriptTag:', {
          id: scriptTag.id,
          src: scriptTag.src,
          message: e.message
        });
      }
    })
  );
}
