import { verifyEmbedRequest } from '@avada/core';
import appConfig from '@functions/config/app';
import shopifyConfig from '@functions/config/shopify';
import shopifyOptionalScopes from '@functions/config/shopifyOptionalScopes';
import { getAppHostName } from '@functions/helpers/requestUrl';
import createErrorHandler from '@functions/middleware/errorHandler';
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import apiRouter from '@functions/routes/api';
import * as errorService from '@functions/services/errorService';
import { registerStorefrontScriptTag } from '@functions/services/scriptTagRegistrationService';
import { registerOrdersCreateWebhook } from '@functions/services/webhookRegistrationService';
import App from 'koa';
import render from 'koa-ejs';
import path from 'path';

// Initialize all demand configuration for an application
const api = new App();
api.proxy = true;

render(api, {
  cache: true,
  debug: false,
  layout: false,
  root: path.resolve(__dirname, '../../views'),
  viewExt: 'html'
});
api.use(createErrorHandler());

const registeredInstallAssetsCache = new Set();

const verifyEmbedOptions = {
  returnHeader: true,
  apiKey: shopifyConfig.apiKey,
  scopes: shopifyConfig.scopes,
  secret: shopifyConfig.secret,
  isEmbeddedApp: true,
  optionalScopes: shopifyOptionalScopes,
  accessTokenKey: shopifyConfig.accessTokenKey,
  afterLogin: async ctx => {
    if (process.env.NODE_ENV === 'production') return;

    // Đảm bảo webhook + ScriptTag dev đang trỏ đúng tunnel hiện tại, đỡ phải unistall app
    // tránh tránh tình trạng tunnel đổi nhưng webhook/scriptTag chưa được cập nhật.
    try {
      const shopifyDomain = ctx.state.shopify.shop;
      const cacheKey = `${shopifyDomain}:${appConfig.baseUrl}`;
      if (registeredInstallAssetsCache.has(cacheKey)) return;

      const shop = await getShopByShopifyDomain(shopifyDomain);
      if (!shop?.id) return;

      const webhook = await registerOrdersCreateWebhook({ shop });
      const scriptTag = await registerStorefrontScriptTag({ shop });
      registeredInstallAssetsCache.add(cacheKey);
      console.log('After login dev install asset registration result:', {
        webhook,
        scriptTag
      });
    } catch (e) {
      console.error('Cannot register dev install assets after login:', e);
    }
  }
};

// Middleware - Verify all incoming embbeded requests are from Shopify, and handle authentication flow
api.use(async (ctx, next) => {
  const hostName = getAppHostName(ctx, appConfig);
  return verifyEmbedRequest({ ...verifyEmbedOptions, hostName })(ctx, next);
});

const router = apiRouter(true);
// Register all routes for the application
api.use(router.allowedMethods());
api.use(router.routes());

// Handling all errors
api.on('error', errorService.handleError);

export default api;
