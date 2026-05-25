import 'dotenv/config';

const scopes = process.env.SHOPIFY_SCOPES?.split(',')
  .map(scope => scope.trim())
  .filter(Boolean) || ['read_products'];

console.log('Loaded Shopify scopes:', scopes);

export default {
  secret: process.env.SHOPIFY_SECRET || '',
  apiKey: process.env.SHOPIFY_API_KEY || '',
  firebaseApiKey: process.env.SHOPIFY_FIREBASE_API_KEY || '',
  scopes,
  accessTokenKey: process.env.SHOPIFY_ACCESS_TOKEN_KEY || 'avada-apps-access-token'
};
