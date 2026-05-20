import { verifyEmbedRequest } from '@avada/core';
import appConfig from '@functions/config/app';
import shopifyConfig from '@functions/config/shopify';
import shopifyOptionalScopes from '@functions/config/shopifyOptionalScopes';
import { publishTopicAsync } from '@functions/helpers/pubsub/publishTopic';
import { getAppHostName } from '@functions/helpers/requestUrl';
import createErrorHandler from '@functions/middleware/errorHandler';
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import apiRouter from '@functions/routes/api';
import * as errorService from '@functions/services/errorService';
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

const verifyEmbedOptions = {
  returnHeader: true,
  apiKey: shopifyConfig.apiKey,
  scopes: shopifyConfig.scopes,
  secret: shopifyConfig.secret,
  isEmbeddedApp: true,
  optionalScopes: shopifyOptionalScopes,
  accessTokenKey: shopifyConfig.accessTokenKey,
  afterLogin: async ctx => {
    try {
      // supspense shop data after login, to make sure the shop data is ready when the app is loaded in Shopify Admin
      const shopifyDomain = ctx.state.shopify.shop;
      console.log('After login for' + shopifyDomain);
    } catch (e) {
      console.error(e);
    }
  },
  afterInstall: async ctx => {
    try {
      const { shopifyDomain } = ctx.state.shopify.shop;
      console.log('After install for' + shopifyDomain);
      const shop = await getShopByShopifyDomain(shopifyDomain);

      // get shop then publish background task to handle after instal
      publishTopicAsync('backgroundHandling', {
        type: 'afterInstall',
        shopId: shop.id,
        shopifyDomain
      });
    } catch (e) {
      console.error('afterInstall error:', e);
    }
  },
  initialPlan: {
    id: 'free',
    name: 'Free',
    price: 0,
    trialDays: 0,
    features: {}
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
