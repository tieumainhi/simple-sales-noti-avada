import appConfig from '@functions/config/app';
import { initShopify } from '@functions/services/shopifyService';

const ORDERS_CREATE_TOPIC = 'orders/create';

/**
 * @param {Object} params
 * @param {Object} params.shop
 * @returns {Promise<{id: number|null, address: string, action: string}>}
 */
export async function registerOrdersCreateWebhook({ shop }) {
  const shopify = initShopify(shop);
  const address = getOrdersCreateWebhookAddress();

  if (!address) {
    console.error('Cannot register orders/create webhook because APP_BASE_URL is missing');
    return { id: null, address: '', action: 'skipped' };
  }

  const existingWebhooks = await shopify.webhook.list({ topic: ORDERS_CREATE_TOPIC });
  const exactWebhook = existingWebhooks.find(webhook => webhook.address === address);

  if (exactWebhook) {
    console.log('orders/create webhook already registered:', {
      id: exactWebhook.id,
      address
    });
    return { id: exactWebhook.id, address, action: 'exists' };
  }

  // If there's a webhook with the same topic but different address, update it to avoid duplicates
  const sameTopicWebhook = existingWebhooks[0];
  if (sameTopicWebhook?.id) {
    const updated = await shopify.webhook.update(sameTopicWebhook.id, {
      topic: ORDERS_CREATE_TOPIC,
      address,
      format: 'json'
    });

    console.log('orders/create webhook updated:', {
      id: updated.id,
      address
    });
    return { id: updated.id, address, action: 'updated' };
  }

  const created = await shopify.webhook.create({
    topic: ORDERS_CREATE_TOPIC,
    address,
    format: 'json'
  });

  console.log('orders/create webhook registered:', {
    id: created.id,
    address
  });
  return { id: created.id, address, action: 'created' };
}

/**
 * @returns {string}
 */
function getOrdersCreateWebhookAddress() {
  if (!appConfig.baseUrl) return '';

  const baseUrl = appConfig.baseUrl.startsWith('http')
    ? appConfig.baseUrl
    : `https://${appConfig.baseUrl}`;

  return `${baseUrl.replace(/\/$/, '')}/webhook/orders/create`;
}
