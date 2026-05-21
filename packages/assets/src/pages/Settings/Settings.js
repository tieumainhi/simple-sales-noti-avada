import React from 'react';
import { Card, Layout, Page, Tabs } from '@shopify/polaris';
import { useCallback, useState } from 'react';
import DisplayTab from './components/DisplayTab';
import TriggersTab from './components/TriggersTab';
import '@assets/styles/common/SalesPop.scss';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';

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
  const [position, setPosition] = useState('bottom-left');
  const [allowShow, setAllowShow] = useState('all');
  const [displayDuration, setDisplayDuration] = useState(5);
  const [firstDelay, setFirstDelay] = useState(10);
  const [popsInterval, setPopsInterval] = useState(2);
  const [maxPopsDisplay, setMaxPopsDisplay] = useState(20);
  const [includedPages, setIncludedPages] = useState('');
  const [excludedPages, setExcludedPages] = useState('');
  const [hideTimeAgo, setHideTimeAgo] = useState(false);
  const [truncateContent, setTruncateContent] = useState(true);
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

  return (
    <Page
      title="Settings"
      subtitle="Decide how your notifications will display"
      primaryAction={{ content: 'Save', onAction: () => {}, loading: false }}
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
