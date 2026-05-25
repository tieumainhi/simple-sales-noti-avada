import App from 'koa';
import 'isomorphic-fetch';
import { contentSecurityPolicy, shopifyAuth } from '@avada/core';
import shopifyConfig from '@functions/config/shopify';
import render from 'koa-ejs';
import path from 'path';
import createErrorHandler from '@functions/middleware/errorHandler';
import firebase from 'firebase-admin';
import appConfig from '@functions/config/app';
import shopifyOptionalScopes from '@functions/config/shopifyOptionalScopes';
import { getAppHostName } from '@functions/helpers/requestUrl';
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import { handleAfterInstall } from '@functions/services/installationService';

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

// Initialize all demand configuration for an application
// handle xử lý cài app, login app, OAuth callback, lưu access token/session, redirect về embedded ap
const app = new App();
app.proxy = true;

render(app, {
  cache: true,
  debug: false,
  layout: false,
  root: path.resolve(__dirname, '../../views'),
  viewExt: 'html'
});
app.use(createErrorHandler());
app.use(contentSecurityPolicy(true));

const authOptions = {
  apiKey: shopifyConfig.apiKey,
  accessTokenKey: shopifyConfig.accessTokenKey,
  firebaseApiKey: shopifyConfig.firebaseApiKey,
  scopes: shopifyConfig.scopes,
  secret: shopifyConfig.secret,
  successRedirect: '/embed',
  initialPlan: {
    id: 'free',
    name: 'Free',
    price: 0,
    trialDays: 0,
    features: {}
  },
  isEmbeddedApp: true,
  afterInstall: async ctx => {
    try {
      const shopifyDomain = ctx.state.shopify.shop;
      console.log('After install for ' + shopifyDomain);

      const shop = await getShopByShopifyDomain(shopifyDomain);
      if (!shop?.id) {
        throw new Error(`Shop not found after install: ${shopifyDomain}`);
      }

      // For this training scope we run installation work directly in the OAuth callback.
      // In production or heavier flows, publish a Pub/Sub background job instead so install
      // redirect is not blocked by Shopify API calls and Firestore writes.
      const result = await handleAfterInstall({
        shopId: shop.id,
        shopifyDomain
      });
      console.log('After install result:', result);
    } catch (e) {
      console.error('afterInstall error:', e);
    }
  },
  afterThemePublish: ctx => {
    // Publish assets when theme is published or changed here
    return (ctx.body = {
      success: true
    });
  },
  optionalScopes: shopifyOptionalScopes
};

// Register all routes for the application
app.use(async (ctx, next) => {
  const hostName = getAppHostName(ctx, appConfig);
  return shopifyAuth({ ...authOptions, hostName }).routes()(ctx, next);
});

// Handling all errors
app.on('error', err => {
  console.error(err);
});

export default app;
