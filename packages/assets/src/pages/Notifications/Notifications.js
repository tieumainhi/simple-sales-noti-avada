import React from 'react';
import { Card, InlineStack, Layout, Page, ResourceList, Text } from '@shopify/polaris';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';

const sampleNotifications = [
  {
    id: '1',
    firstName: 'Someone',
    location: 'New York, United States',
    productName: 'Purchased Sport Sneaker',
    timestamp: 'a day ago',
    date: 'From March 8, 2021'
  },
  {
    id: '2',
    firstName: 'Someone',
    location: 'New York, United States',
    productName: 'Purchased Sport Sneaker',
    timestamp: 'a day ago',
    date: 'From March 8, 2021'
  },
  {
    id: '3',
    firstName: 'Someone',
    location: 'New York, United States',
    productName: 'Purchased Sport Sneaker',
    timestamp: 'a day ago',
    date: 'From March 5, 2021'
  }
];

/**
 * Render notification list mockup.
 *
 * @returns {JSX.Element}
 */
export default function Notifications() {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [sortValue, setSortValue] = React.useState('newest');

  const handleSelectionChange = React.useCallback(selectedItems => {
    setSelectedRows(
      selectedItems === 'All'
        ? sampleNotifications.map(notification => notification.id)
        : selectedItems
    );
  }, []);

  return (
    <Page fullWidth title="Notifications" subtitle="List of sales notification from Shopify">
      <Layout>
        <Layout.Section fullWidth>
          <Card padding="0">
            <ResourceList
              resourceName={{ singular: 'notification', plural: 'notifications' }}
              items={sampleNotifications}
              selectable
              selectedItems={selectedRows}
              onSelectionChange={handleSelectionChange}
              sortValue={sortValue}
              sortOptions={[
                { label: 'Newest update', value: 'newest' },
                { label: 'Oldest update', value: 'oldest' }
              ]}
              onSortChange={setSortValue}
              headerContent={`Showing ${sampleNotifications.length} notifications`}
              pagination={{
                hasPrevious: true,
                onPrevious: () => {
                  console.log('Previous');
                },
                hasNext: true,
                onNext: () => {
                  console.log('Next');
                }
              }}
              renderItem={item => (
                <ResourceList.Item
                  id={item.id}
                  accessibilityLabel={`View details for ${item.productName}`}
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <NotificationPopup />
                    <Text as="span" alignment="end">
                      {item.date}
                    </Text>
                  </InlineStack>
                </ResourceList.Item>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
