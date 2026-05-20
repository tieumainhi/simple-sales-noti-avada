/**
 * @param {Context|Object|*} ctx
 * @param {{baseUrl: string, isProduction: boolean}} appConfig
 * @returns {string}
 */
export function getAppHostName(ctx, appConfig) {
  const fallbackHost = appConfig.baseUrl || '';
  return appConfig.isProduction ? cleanHost(fallbackHost) : getRequestHostName(ctx, fallbackHost);
}

/**
 * @param {Context|Object|*} ctx
 * @param {{baseUrl: string, isProduction: boolean}} appConfig
 * @returns {string}
 */
export function getAppBaseUrl(ctx, appConfig) {
  if (!appConfig.isProduction) return getRequestBaseUrl(ctx, appConfig.baseUrl);

  const protocol =
    getUrlProtocol(appConfig.baseUrl)
      .replace(':', '')
      .trim() || 'https';
  return `${protocol}://${getAppHostName(ctx, appConfig)}`;
}

/**
 * @param {Context|Object|*} ctx
 * @param {string} fallbackHost
 * @returns {string}
 */
export function getRequestHostName(ctx, fallbackHost = '') {
  const forwardedHost = getHeader(ctx, 'x-forwarded-host');
  const originHost = getUrlHost(getHeader(ctx, 'origin'));
  const refererHost = getUrlHost(getHeader(ctx, 'referer'));
  const requestHost = ctx.host || '';

  return (
    firstAppHost(forwardedHost, requestHost, originHost, refererHost, fallbackHost) ||
    cleanHost(fallbackHost || forwardedHost || requestHost || originHost || refererHost)
  );
}

/**
 * @param {Context|Object|*} ctx
 * @param {string} fallbackHost
 * @returns {string}
 */
export function getRequestBaseUrl(ctx, fallbackHost = '') {
  const host = getRequestHostName(ctx, fallbackHost);
  const forwardedProto = firstValue(getHeader(ctx, 'x-forwarded-proto'));
  const originProtocol = getUrlProtocol(getHeader(ctx, 'origin'));
  const refererProtocol = getUrlProtocol(getHeader(ctx, 'referer'));
  const fallbackProtocol = getUrlProtocol(fallbackHost);
  const protocol = isLocalHost(host)
    ? (
        forwardedProto ||
        originProtocol ||
        refererProtocol ||
        fallbackProtocol ||
        ctx.protocol ||
        'http'
      )
        .replace(':', '')
        .trim()
    : 'https';

  return `${protocol}://${host}`;
}

/**
 * @param {Context|Object|*} ctx
 * @param {string} key
 * @returns {string}
 */
function getHeader(ctx, key) {
  return typeof ctx.get === 'function' ? ctx.get(key) : '';
}

/**
 * @param {...string} hosts
 * @returns {string}
 */
function firstAppHost(...hosts) {
  return hosts.map(cleanHost).find(isAppHost) || '';
}

/**
 * @param {string} value
 * @returns {string}
 */
function cleanHost(value = '') {
  return firstValue(value)
    .replace(/https?:\/\//, '')
    .replace(/\/.*$/, '');
}

/**
 * @param {string} value
 * @returns {string}
 */
function firstValue(value = '') {
  return String(value || '')
    .split(',')[0]
    .trim();
}

/**
 * @param {string} value
 * @returns {string}
 */
function getUrlHost(value = '') {
  try {
    return new URL(value).host;
  } catch (error) {
    void error;
    return '';
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
function getUrlProtocol(value = '') {
  try {
    return new URL(value).protocol;
  } catch (error) {
    void error;
    return '';
  }
}

/**
 * @param {string} host
 * @returns {boolean}
 */
function isAppHost(host) {
  return Boolean(host) && !isLocalHost(host) && !isShopifyHost(host);
}

/**
 * @param {string} host
 * @returns {boolean}
 */
function isShopifyHost(host) {
  const hostname = cleanHost(host).split(':')[0];
  return hostname === 'admin.shopify.com' || hostname.endsWith('.myshopify.com');
}

/**
 * @param {string} host
 * @returns {boolean}
 */
function isLocalHost(host) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(host);
}
