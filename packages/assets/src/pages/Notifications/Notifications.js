import React from 'react';
import { Box, Card, InlineStack, Layout, Page, ResourceList, Text } from '@shopify/polaris';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import { formatDateOnly } from '@assets/helpers/utils/formatFullTime';

const pageLimit = 20;
const resourceName = { singular: 'notification', plural: 'notifications' };
const sortOptions = [
  { label: 'Newest update', value: 'newest' },
  { label: 'Oldest update', value: 'oldest' }
];
const emptyState = (
  <Box padding="400">
    <Text as="p" tone="subdued">
      No notifications yet.
    </Text>
  </Box>
);

/**
 * Render notification list.
 *
 * @returns {JSX.Element}
 */
export default function Notifications() {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [sortValue, setSortValue] = React.useState('newest');
  const { data: notifications, count, pageInfo, loading, fetchApi } = useFetchApi({
    url: '/notifications',
    defaultData: [],
    initQueries: { sort: sortValue, limit: pageLimit }
  });

  function fetchNotifications(params = {}) {
    fetchApi('/notifications', {
      sort: sortValue,
      limit: pageLimit,
      ...params
    });
  }

  function handleSelectionChange(selectedItems) {
    setSelectedRows(
      selectedItems === 'All' ? notifications.map(notification => notification.id) : selectedItems
    );
  }

  function handleSortChange(value) {
    setSortValue(value);
    setSelectedRows([]);
    fetchNotifications({ sort: value });
  }

  function handleNext() {
    const lastNotification = notifications[notifications.length - 1];
    if (!lastNotification?.id) return;

    fetchNotifications({ after: lastNotification.id });
  }

  function handlePrevious() {
    const firstNotification = notifications[0];
    if (!firstNotification?.id) return;

    fetchNotifications({ before: firstNotification.id });
  }

  return (
    <Page fullWidth title="Notifications" subtitle="List of sales notification from Shopify">
      <Layout>
        <Layout.Section fullWidth>
          <Card padding="0">
            <ResourceList
              resourceName={resourceName}
              items={notifications}
              loading={loading}
              selectable
              selectedItems={selectedRows}
              onSelectionChange={handleSelectionChange}
              sortValue={sortValue}
              sortOptions={sortOptions}
              onSortChange={handleSortChange}
              headerContent={`Showing ${count || notifications.length} notifications`}
              emptyState={emptyState}
              pagination={{
                hasPrevious: Boolean(pageInfo.hasPre),
                onPrevious: handlePrevious,
                hasNext: Boolean(pageInfo.hasNext),
                onNext: handleNext
              }}
              renderItem={renderNotification}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * @param {Object} item
 * @returns {JSX.Element}
 */
function renderNotification(item) {
  return (
    <ResourceList.Item id={item.id} accessibilityLabel={`View details for ${item.productName}`}>
      <InlineStack align="space-between" blockAlign="center">
        <NotificationPopup
          firstName={item.firstName || 'Someone'}
          city={item.city || 'New York'}
          country={item.country || 'United States'}
          productName={item.productName || 'Sport Sneaker'}
          productImage={item.productImage}
          timestamp={formatTimeAgo(item.timestamp)}
        />
        <Text as="span" alignment="end" tone="subdued">
          {formatNotificationDate(item.timestamp)}
        </Text>
      </InlineStack>
    </ResourceList.Item>
  );
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {Date|null}
 */
function toDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000);

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {string}
 */
function formatNotificationDate(timestamp) {
  const date = toDate(timestamp);
  return date ? `From ${formatDateOnly(date)}` : '';
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {string}
 */
function formatTimeAgo(timestamp) {
  const date = toDate(timestamp);
  if (!date) return 'a day ago';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
