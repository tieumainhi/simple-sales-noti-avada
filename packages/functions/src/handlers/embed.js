import App from 'koa';
import createErrorHandler from '../middleware/errorHandler';
import * as errorService from '../services/errorService';
import appConfig from '../config/app';
import shopifyConfig from '../config/shopify';
import { getAppBaseUrl } from '../helpers/requestUrl';
import render from 'koa-ejs';
import path from 'path';
import fetch from 'node-fetch';
import fs from 'fs/promises';

console.log('NODE_ENV', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Initialize all demand configuration for an application
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

app.use(async ctx => {
  const shop = ctx.query.shop;
  ctx.set('Content-Security-Policy', `frame-ancestors https://${shop} https://admin.shopify.com;`);
  if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const embedHtml = await getEmbedTemplate(ctx);

  return (ctx.body = embedHtml);
});
// Handling all errors
app.on('error', errorService.handleError);

export default app;

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<string>}
 */
async function getEmbedTemplate(ctx) {
  if (process.env.NODE_ENV !== 'development') {
    return await fetchEmbedTemplateFromCurrentHost(ctx);
  }

  try {
    return await fetchEmbedTemplateFromCurrentHost(ctx);
  } catch (e) {
    console.warn('Failed to fetch embed template from current host:', e.message);
    return await getLocalDevTemplate();
  }
}

/**
 * @returns {Promise<string|null>}
 */
async function getLocalDevTemplate() {
  if (process.env.NODE_ENV !== 'development') return null;

  try {
    const templatePath = path.resolve(__dirname, '../../../assets/embed-template.html');
    const template = await fs.readFile(templatePath, 'utf8');
    return withViteDevPreamble(template).replace(/%VITE_SHOPIFY_API_KEY%/g, shopifyConfig.apiKey);
  } catch (e) {
    throw new Error(`Failed to load local embed template: ${e.message}`);
  }
}

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<string>}
 */
async function fetchEmbedTemplateFromCurrentHost(ctx) {
  const baseUrl = getAppBaseUrl(ctx, appConfig);
  const embedData = await fetch(`${baseUrl}/embed-template.html`, {
    headers: {
      'Cache-Control': 'max-age=300' // Cache for 1 hour
    },
    cf: {
      // Cache on Cloudflare if you're using it
      cacheTtl: 300,
      cacheEverything: true
    }
  });
  if (!embedData.ok) {
    throw new Error(`Failed to fetch ${baseUrl}/embed-template.html: ${embedData.status}`);
  }
  const cacheControl = embedData.headers.get('cache-control');
  if (cacheControl) {
    ctx.set('Cache-Control', cacheControl);
  }
  return await embedData.text();
}

/**
 * @param {string} template
 * @returns {string}
 */
function withViteDevPreamble(template) {
  const preamble = `<script type="module" src="/@vite/client"></script>
<script type="module">
  import { injectIntoGlobalHook } from "/@react-refresh";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => type => type;
</script>`;

  return template.includes('/@react-refresh')
    ? template
    : template.replace(
        '<script type="module" src="/src/embed.js"></script>',
        `${preamble}
<script type="module" src="/src/embed.js"></script>`
      );
}
