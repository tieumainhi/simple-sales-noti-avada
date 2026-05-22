import React, { useCallback, useEffect, useState } from 'react';
import { Card, Layout, Page, Tabs } from '@shopify/polaris';
import DisplayTab from './components/DisplayTab';
import TriggersTab from './components/TriggersTab';
import '@assets/styles/common/SalesPop.scss';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import useEditApi from '@assets/hooks/api/useEditApi';

const defaultSettings = {
  position: 'bottom-left',
  hideTimeAgo: false,
  truncateProductName: true,
  displayDuration: 5,
  firstDelay: 3,
  popsInterval: 5,
  maxPopsDisplay: 20,
  includedUrls: '',
  excludedUrls: '',
  allowShow: 'all'
};

const getFormSettings = (setting = defaultSettings) => ({
  position: setting.position || defaultSettings.position,
  allowShow: setting.allowShow || defaultSettings.allowShow,
  displayDuration: setting.displayDuration ?? defaultSettings.displayDuration,
  firstDelay: setting.firstDelay ?? defaultSettings.firstDelay,
  popsInterval: setting.popsInterval ?? defaultSettings.popsInterval,
  maxPopsDisplay: setting.maxPopsDisplay ?? defaultSettings.maxPopsDisplay,
  includedPages: setting.includedUrls || defaultSettings.includedUrls,
  excludedPages: setting.excludedUrls || defaultSettings.excludedUrls,
  hideTimeAgo: setting.hideTimeAgo ?? defaultSettings.hideTimeAgo,
  truncateContent: setting.truncateProductName ?? defaultSettings.truncateProductName
});

const tabs = [
  {
    id: 'display',
    content: 'Display',
    panelID: 'display-panel'
  },
  {
    id: 'triggers',
    content: 'Triggers',
    panelID: 'triggers-panel'
  }
];

/**
 * @return {JSX.Element}
 */
export default function Settings() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formSettings, setFormSettings] = useState(() => getFormSettings());

  const { data: settings, fetched, loading } = useFetchApi({
    url: '/settings',
    defaultData: defaultSettings
  });
  const { editing, handleEdit } = useEditApi({
    url: '/settings',
    fullResp: true,
    successMsg: 'Settings saved'
  });

  const applySettings = useCallback(setting => {
    setFormSettings(getFormSettings(setting));
  }, []);

  useEffect(() => {
    if (fetched) {
      applySettings(settings);
    }
  }, [applySettings, fetched, settings]);

  const updateFormSetting = useCallback((key, value) => {
    setFormSettings(currentSettings => ({
      ...currentSettings,
      [key]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const {
      position,
      allowShow,
      displayDuration,
      firstDelay,
      popsInterval,
      maxPopsDisplay,
      includedPages,
      excludedPages,
      hideTimeAgo,
      truncateContent
    } = formSettings;

    const response = await handleEdit({
      position,
      allowShow,
      displayDuration,
      firstDelay,
      popsInterval,
      maxPopsDisplay,
      includedUrls: includedPages,
      excludedUrls: excludedPages,
      hideTimeAgo,
      truncateProductName: truncateContent
    });

    if (response?.data) {
      applySettings(response.data);
    }
  }, [applySettings, formSettings, handleEdit]);

  return (
    <Page
      title="Settings"
      subtitle="Decide how your notifications will display"
      primaryAction={{
        content: 'Save',
        onAction: handleSave,
        loading: editing,
        disabled: loading || editing
      }}
      fullWidth
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <NotificationPopup />
        </Layout.Section>

        <Layout.Section>
          <Card padding="20">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
              {selectedTab === 0 ? (
                <DisplayTab settings={formSettings} onChange={updateFormSetting} />
              ) : (
                <TriggersTab settings={formSettings} onChange={updateFormSetting} />
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

Settings.propTypes = {};
