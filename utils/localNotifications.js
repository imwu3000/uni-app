/**
 * Creates a local notification.
 * For now, it logs to console and shows a uni-app toast.
 *
 * @param {object} options
 * @param {string} options.title - The title of the notification.
 * @param {string} options.content - The main content of the notification.
 * @param {object} [options.payload] - Optional data to pass along with the notification.
 */
export const createNotification = ({ title, content, payload }) => {
  console.log(`[Local Notification]
Title: ${title}
Content: ${content}
Payload: ${JSON.stringify(payload || {})}`);

  uni.showToast({
    title: title,
    icon: 'none', // 'none' is better for notifications that aren't necessarily success/error
    duration: 3000,
    // Uni-app toast doesn't directly show content, so title might need to be concise
    // For more detailed notifications, a custom component or a real plugin would be needed.
  });

  // In a real app, you might use something like:
  // uni.createPushMessage({ title, content, payload, ... })
  // or a specific local notification plugin.
};

export default createNotification;
