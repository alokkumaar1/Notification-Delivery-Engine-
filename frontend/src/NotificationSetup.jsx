// src/NotificationSetup.jsx
import { messaging, vapidKey } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Called only when push is selected
export async function registerForPush(callback) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🚫 Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    console.log('✅ FCM Token:', token);

    // Foreground message listener
    onMessage(messaging, (payload) => {
      console.log('📩 Push notification received:', payload);
      if (callback) callback(payload);
    });

    return token;
  } catch (err) {
    console.error('❌ Error getting FCM token', err);
    return null;
  }
}
