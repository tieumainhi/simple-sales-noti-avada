/**
 * Scripttag Entry Point
 *
 * This script is loaded on the storefront via Shopify ScriptTag.
 * It initializes and renders Preact components into the storefront.
 *
 * Build: yarn build (in packages/scripttag)
 * Output: static/scripttag/avada-storefront.min.js
 */

import { render } from 'preact';
import NotificationWidget from './components/NotificationWidget/NotificationWidget.js';
import ApiManager from './managers/ApiManager';
import { delay, insertAsLastChild } from './helpers';

const CONTAINER_ID = 'avada-sales-pop';
let isRunning = false;

/**
 * Initialize the widget
 */
async function init() {
  if (isRunning) return;
  isRunning = true;

  try {
    const apiManager = new ApiManager();
    const response = await apiManager.getWidgetData();
    const { setting, notifications } = response?.data || {};

    if (!setting || !Array.isArray(notifications) || !notifications.length) {
      console.log('[Avada] No sales popup data');
      return;
    }

    if (!shouldShowOnCurrentPage(setting)) {
      console.log('[Avada] Sales popup hidden on this page');
      return;
    }

    const container = createContainer();
    const maxPops = Math.min(
      toNumber(setting.maxPopsDisplay, notifications.length),
      notifications.length
    );

    await delay(toSeconds(setting.firstDelay, 0));

    for (let index = 0; index < maxPops; index += 1) {
      render(
        <NotificationWidget notification={notifications[index]} setting={setting} />,
        container
      );

      await delay(toSeconds(setting.displayDuration, 5));
      render(null, container);

      if (index < maxPops - 1) {
        await delay(toSeconds(setting.popsInterval, 5));
      }
    }

    console.log('[Avada] Sales popup initialized');
  } catch (error) {
    console.error('[Avada] Failed to initialize sales popup:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Create the widget container element
 */
function createContainer() {
  const existingContainer = document.getElementById(CONTAINER_ID);
  if (existingContainer) {
    render(null, existingContainer);
    return existingContainer;
  }

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.className = 'avada-sales-pop-container';
  insertAsLastChild(container, document.body);

  return container;
}

function shouldShowOnCurrentPage(setting) {
  if (setting.enabled === false || setting.active === false) return false;

  const currentUrl = window.location.href;
  const excludedRules = parseUrlRules(setting.excludedUrls);
  if (excludedRules.some(rule => matchesUrlRule(currentUrl, rule))) {
    return false;
  }

  if (setting.allowShow !== 'specific') return true;

  const includedRules = parseUrlRules(setting.includedUrls);
  return includedRules.some(rule => matchesUrlRule(currentUrl, rule));
}

function parseUrlRules(value = '') {
  return String(value)
    .split(/\r?\n|,/)
    .map(rule => rule.trim())
    .filter(Boolean);
}

function matchesUrlRule(currentUrl, rule) {
  const normalizedUrl = currentUrl.replace(/\/$/, '');
  const normalizedRule = rule.replace(/\/$/, '');

  if (normalizedRule === '*') return true;
  if (normalizedRule.startsWith('/')) {
    return window.location.pathname.replace(/\/$/, '').includes(normalizedRule);
  }

  return normalizedUrl.includes(normalizedRule);
}

function toSeconds(value, fallback) {
  return toNumber(value, fallback) * 1000;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for manual re-initialization (e.g., after AJAX navigation)
window.avadaWidgetInit = init;
