/**
 * Background handler for PubSub messages
 *
 * Usage:
 *   publishTopic('backgroundHandling', {
 *     type: 'processOrder',
 *     shopId: '...',
 *     data: {...}
 *   })
 *
 * @param event - CloudEvent with PubSub message
 * @returns {Promise<void>}
 */
export default async function subscribeBackgroundHandling(event) {
  try {
    const data = event.data.message.json;

    // get type and shopId from the message and handle accordingly
    const { type } = data;

    switch (type) {
      default:
        console.log('Unknown background task type:', type);
    }
  } catch (e) {
    console.error('Background handling error:', e);
  }
}
