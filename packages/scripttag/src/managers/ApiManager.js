/**
 * API Manager
 *
 * Handles all API requests to the backend.
 * Uses XMLHttpRequest for maximum browser compatibility.
 */

import { makeRequest } from '../helpers';

const SCRIPT_SRC_PATH = '/scripttag/avada-storefront.min.js';
const DEFAULT_NOTIFICATIONS_LIMIT = 20;

export default class ApiManager {
  constructor() {
    const currentScriptUrl = getCurrentScriptUrl();

    this.shopDomain = window.Shopify?.shop || getShopDomainFromScriptUrl(currentScriptUrl) || '';
    this.apiUrl = (process.env.API_URL || getOriginFromUrl(currentScriptUrl) || '').replace(
      /\/$/,
      ''
    );
  }

  /**
   * Get widget data from API
   * Falls back to window data if available (set by Liquid)
   */
  async getWidgetData() {
    // Option 1: Use data embedded in page by Liquid (faster, no API call)
    if (window.__avadaWidgetData) {
      return window.__avadaWidgetData;
    }

    // Option 2: Fetch from API (when data can't be embedded)
    if (!this.shopDomain) {
      console.warn('[Avada] Shop domain not found');
      return null;
    }

    try {
      // Endpoint exposed by backend: /clientApi/setting-notifications
      const url = `${
        this.apiUrl
      }/clientApi/setting-notifications?shopifyDomain=${encodeURIComponent(
        this.shopDomain
      )}&limit=${DEFAULT_NOTIFICATIONS_LIMIT}`;
      const response = await makeRequest(url);
      return response;
    } catch (error) {
      console.error('[Avada] API request failed:', error);
      return null;
    }
  }

  /**
   * Track an event (e.g., widget displayed, clicked)
   */
  async trackEvent(eventType, eventData = {}) {
    if (!this.apiUrl) return;

    try {
      await makeRequest(
        `${this.apiUrl}/clientApi/track`,
        'POST',
        {
          shopDomain: this.shopDomain,
          eventType,
          ...eventData
        },
        { contentType: 'application/json' }
      );
    } catch (error) {
      // Silent fail for tracking
      console.warn('[Avada] Tracking failed:', error);
    }
  }
}

function getCurrentScriptUrl() {
  if (document.currentScript?.src) {
    return document.currentScript.src;
  }

  const scripts = document.getElementsByTagName('script');
  for (let index = scripts.length - 1; index >= 0; index -= 1) {
    const src = scripts[index].src || '';
    if (src.includes(SCRIPT_SRC_PATH)) {
      return src;
    }
  }

  return '';
}

function getOriginFromUrl(url) {
  try {
    return url ? new URL(url).origin : '';
  } catch (e) {
    return '';
  }
}

function getShopDomainFromScriptUrl(url) {
  try {
    return url ? new URL(url).searchParams.get('shop') : '';
  } catch (e) {
    return '';
  }
}
