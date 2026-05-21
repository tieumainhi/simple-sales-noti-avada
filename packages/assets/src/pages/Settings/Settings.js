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
  const [position, setPosition] = useState(defaultSettings.position);
  const [allowShow, setAllowShow] = useState(defaultSettings.allowShow);
  const [displayDuration, setDisplayDuration] = useState(defaultSettings.displayDuration);
  const [firstDelay, setFirstDelay] = useState(defaultSettings.firstDelay);
  const [popsInterval, setPopsInterval] = useState(defaultSettings.popsInterval);
  const [maxPopsDisplay, setMaxPopsDisplay] = useState(defaultSettings.maxPopsDisplay);
  const [includedPages, setIncludedPages] = useState(defaultSettings.includedUrls);
  const [excludedPages, setExcludedPages] = useState(defaultSettings.excludedUrls);
  const [hideTimeAgo, setHideTimeAgo] = useState(defaultSettings.hideTimeAgo);
  const [truncateContent, setTruncateContent] = useState(defaultSettings.truncateProductName);

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
    setPosition(setting.position || defaultSettings.position);
    setAllowShow(setting.allowShow || defaultSettings.allowShow);
    setDisplayDuration(setting.displayDuration ?? defaultSettings.displayDuration);
    setFirstDelay(setting.firstDelay ?? defaultSettings.firstDelay);
    setPopsInterval(setting.popsInterval ?? defaultSettings.popsInterval);
    setMaxPopsDisplay(setting.maxPopsDisplay ?? defaultSettings.maxPopsDisplay);
    setIncludedPages(setting.includedUrls || defaultSettings.includedUrls);
    setExcludedPages(setting.excludedUrls || defaultSettings.excludedUrls);
    setHideTimeAgo(setting.hideTimeAgo ?? defaultSettings.hideTimeAgo);
    setTruncateContent(setting.truncateProductName ?? defaultSettings.truncateProductName);
  }, []);

  useEffect(() => {
    if (fetched) {
      applySettings(settings);
    }
  }, [applySettings, fetched, settings]);

  const handleSetSelectedTab = useCallback(
    selectedTabIndex => setSelectedTab(selectedTabIndex),
    []
  );
  const handleSetPosition = useCallback(setPosition, [setPosition]);
  const handleSetAllowShow = useCallback(setAllowShow, [setAllowShow]);
  const handleSetDisplayDuration = useCallback(setDisplayDuration, [setDisplayDuration]);
  const handleSetFirstDelay = useCallback(setFirstDelay, [setFirstDelay]);
  const handleSetPopsInterval = useCallback(setPopsInterval, [setPopsInterval]);
  const handleSetMaxPopsDisplay = useCallback(setMaxPopsDisplay, [setMaxPopsDisplay]);
  const handleSetIncludedPages = useCallback(setIncludedPages, [setIncludedPages]);
  const handleSetExcludedPages = useCallback(setExcludedPages, [setExcludedPages]);
  const handleSetHideTimeAgo = useCallback(setHideTimeAgo, [setHideTimeAgo]);
  const handleSetTruncateContent = useCallback(setTruncateContent, [setTruncateContent]);
  const handleSave = useCallback(async () => {
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
  }, [
    allowShow,
    applySettings,
    displayDuration,
    excludedPages,
    firstDelay,
    handleEdit,
    hideTimeAgo,
    includedPages,
    maxPopsDisplay,
    popsInterval,
    position,
    truncateContent
  ]);

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
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleSetSelectedTab}>
              {selectedTab === 0 ? (
                <DisplayTab
                  position={position}
                  setPosition={handleSetPosition}
                  displayDuration={displayDuration}
                  setDisplayDuration={handleSetDisplayDuration}
                  firstDelay={firstDelay}
                  setFirstDelay={handleSetFirstDelay}
                  popsInterval={popsInterval}
                  setPopsInterval={handleSetPopsInterval}
                  maxPopsDisplay={maxPopsDisplay}
                  setMaxPopsDisplay={handleSetMaxPopsDisplay}
                  hideTimeAgo={hideTimeAgo}
                  setHideTimeAgo={handleSetHideTimeAgo}
                  truncateContent={truncateContent}
                  setTruncateContent={handleSetTruncateContent}
                />
              ) : (
                <TriggersTab
                  allowShow={allowShow}
                  setAllowShow={handleSetAllowShow}
                  includedPages={includedPages}
                  setIncludedPages={handleSetIncludedPages}
                  excludedPages={excludedPages}
                  setExcludedPages={handleSetExcludedPages}
                />
              )}
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

Settings.propTypes = {};
