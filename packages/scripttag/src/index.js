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
import React from 'preact';
import NotificationWidget from './components/NotificationWidget/NotificationWidget.js';
import ApiManager from './managers/ApiManager';
import { delay, insertAsLastChild, shouldShowOnCurrentPage, toNumber, toSeconds } from './helpers';

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

    // Fetch widget data from the API
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

    // create <div id="avada-sales-pop" class="avada-sales-pop-container"></div>
    const container = createContainer();

    // limit the number of notifications to display based on settings and available data
    const maxPops = Math.min(
      toNumber(setting.maxPopsDisplay, notifications.length),
      notifications.length
    );

    await delay(toSeconds(setting.firstDelay, 0));

    for (let index = 0; index < maxPops; index += 1) {
      // render component NotificationWidget to div#avada-sales-pop
      render(
        <NotificationWidget notification={notifications[index]} setting={setting} />,
        container
      );

      await delay(toSeconds(setting.displayDuration, 5));

      // hide component NotificationWidget
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

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for manual re-initialization (e.g., after AJAX navigation)
// Usage: window.avadaWidgetInit(); call manually from global window to re-render the widget with updated data (test/debug purpose)
window.avadaWidgetInit = init;
