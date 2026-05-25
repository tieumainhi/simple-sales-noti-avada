import App from 'koa';
import 'isomorphic-fetch';
import { shopifyAuth } from '@avada/core';
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
// Initialize all demand configuration for an application
// handle xử lý cài app, login app, OAuth callback, lưu access token/session, redirect về stadalone app
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

const authOptions = {
  apiKey: shopifyConfig.apiKey,
  accessTokenKey: shopifyConfig.accessTokenKey,
  firebaseApiKey: shopifyConfig.firebaseApiKey,
  scopes: shopifyConfig.scopes,
  secret: shopifyConfig.secret,
  successRedirect: '/',
  initialPlan: {
    id: 'free',
    name: 'Free',
    price: 0,
    trialDays: 0,
    features: {}
  },
  isEmbeddedApp: false,
  prefix: '/authSa',
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

  // function shopifyAuth  =
  // setup OAuth/install/auth callback routes for Shopify app, including:
  // - GET /authSa/shopify -> redirect to Shopify install/auth page
  // - GET /authSa/shopify/callback -> handle callback after install/auth, create session, then redirect to app
  // - GET /authSa/shopify/embed/callback -> handle callback after install/auth when the app is loaded in Shopify Admin, create session, then redirect to app
  // tạo/lưu shop + access token
  // redirect về app
  // /Users/avada/Desktop/Code/simple-sales-noti-avada/node_modules/@avada/core/build/auth.js
  return shopifyAuth({ ...authOptions, hostName }).routes()(ctx, next);
});

// Handling all errors
app.on('error', err => {
  console.error(err);
});

export default app;
