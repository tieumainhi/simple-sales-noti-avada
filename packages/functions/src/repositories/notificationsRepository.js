import { Firestore } from '@google-cloud/firestore';
import { paginateQuery } from '@functions/repositories/helper';

const firestore = new Firestore();
const collection = firestore.collection('notifications');

/**
 * @param {string} shopId
 * @param {Object} query
 * @returns {Promise<{data: *[], count: number, total?: number, pageInfo: Object}>}
 */
export async function getNotifications(shopId, query = {}) {
  const { sortField, direction } = getNotificationOrder(query.sort);
  const queriedRef = collection.where('shopId', '==', shopId).orderBy(sortField, direction);

  return paginateQuery({
    queriedRef,
    collection,
    query,
    defaultLimit: query.limit || 20
  });
}

/**
 * @param {string} shopId
 * @param {Object} data
 * @returns {Promise<string>}
 */
export async function addNotification(shopId, data) {
  const created = await collection.add({
    ...data,
    shopId,
    timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    createdAt: new Date()
  });

  return created.id;
}

/**
 * @param {string} sort
 * @returns {{sortField: string, direction: 'asc'|'desc'}}
 */
function getNotificationOrder(sort) {
  if (sort === 'oldest' || sort === 'timestamp_asc') {
    return { sortField: 'timestamp', direction: 'asc' };
  }

  return { sortField: 'timestamp', direction: 'desc' };
}
