import { Firestore } from '@google-cloud/firestore';
import { DEFAULT_SETTINGS } from '@functions/const/salesPopSettings';
import { prepareDoc } from '@functions/repositories/helper';

const firestore = new Firestore();
/** @type {CollectionReference} */
const collection = firestore.collection('settings');

/**
 * @param {string} shopId
 * @returns {Promise<FirebaseFirestore.QueryDocumentSnapshot|null>}
 */
async function getSettingsDocByShopId(shopId) {
  const doc = await collection.doc(shopId).get();
  if (doc.exists) return doc;

  const docs = await collection
    .where('shopId', '==', shopId)
    .limit(1)
    .get();
  return docs.empty ? null : docs.docs[0];
}

/**
 * @param {string} shopId
 * @returns {Promise<Object|null>}
 */
export async function getSettingsByShopId(shopId) {
  const doc = await getSettingsDocByShopId(shopId);
  return doc ? prepareDoc({ doc }) : null;
}

/**
 * @param {string} shopId
 * @returns {Promise<Object>}
 */
export async function getOrCreateSettings(shopId) {
  const existingSettings = await getSettingsByShopId(shopId);
  if (existingSettings) return existingSettings;

  return createSettings(shopId);
}

/**
 * @param {string} shopId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateSettings(shopId, data) {
  const now = new Date();
  const doc = await getSettingsDocByShopId(shopId);

  if (!doc) {
    return createSettings(shopId, data);
  }

  await doc.ref.update({
    ...data,
    updatedAt: now
  });

  return prepareDoc({ doc: await doc.ref.get() });
}

/**
 * @param {string} shopId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function createSettings(shopId, data = {}) {
  const now = new Date();
  const docRef = collection.doc(shopId);

  await docRef.set({
    ...DEFAULT_SETTINGS,
    ...data,
    shopId,
    createdAt: now,
    updatedAt: now
  });

  return prepareDoc({ doc: await docRef.get() });
}
