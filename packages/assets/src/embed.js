import App from './App';
import React from 'react';
import './styles/app.scss';
import { api } from './helpers';
import { StoreProvider } from '@assets/reducers/storeReducer';
import { collectActiveShopData } from '@assets/services/shopService';
import { createRoot } from 'react-dom/client';
import '@shopify/polaris/build/esm/styles.css';

const hidePreloader = () => {
  const loading = document.getElementById('PreLoading');
  if (loading !== null) {
    loading.style.display = 'none';
  }
};

const renderBootstrapError = error => {
  const container = document.getElementById('app');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'margin: 32px; padding: 16px; border-left: 4px solid #d72c0d; background: #fff4f4; color: #202223; font-family: Arial, sans-serif;';

  const title = document.createElement('h2');
  title.textContent = 'Unable to load app';
  title.style.cssText = 'margin: 0 0 8px; font-size: 18px;';

  const message = document.createElement('p');
  message.textContent = error?.message || 'The app failed to start.';
  message.style.cssText = 'margin: 0; font-size: 14px; line-height: 20px;';

  wrapper.append(title, message);
  container.replaceChildren(wrapper);
};

(async () => {
  try {
    const shopResponse = await api('/shops');
    const { shop, shopInfo } = shopResponse || {};
    if (!shop || !shopInfo) {
      throw new Error('Shop data is missing from /shops response');
    }

    const [activeShop, user] = [
      collectActiveShopData({ shop, shopInfo }),
      { email: shop.email, displayName: shopInfo.shopOwner }
    ];
    // if (activeShop) {
    //   loadCrisp('WEBSITE_ID', shop.crispSessionToken);
    //   pushDataToCrisp({shopData: activeShop, user});
    // }

    hidePreloader();

    const container = document.getElementById('app');
    const root = createRoot(container);
    root.render(
      <StoreProvider {...{ user, activeShop }}>
        <App />
      </StoreProvider>
    );
  } catch (error) {
    hidePreloader();
    console.error(error);
    renderBootstrapError(error);
  }
})();
