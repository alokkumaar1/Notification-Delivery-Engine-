import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAUhHadYTChGy_po-SlM3csH10nUj8nCz4",
  authDomain: "notificationenginepush.firebaseapp.com",
  projectId: "notificationenginepush",
  storageBucket: "notificationenginepush.appspot.com", // ✅ fixed
  messagingSenderId: "497843589699",
  appId: "1:497843589699:web:273be5fa97b9b53637baf6",
  measurementId: "G-BQ3SRL7DXQ"
};

// 🔐 Replace this with your public VAPID key (from Firebase Console > Cloud Messaging tab)
const vapidKey = "BLu9-Lu8B4kc_Ag9xN1cBJLzY8tsax1PpU_k7UDCc6ocngk6q0bPi5M1Jg46heS_YbN_tkBjN45vAiTamH41fGU";

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { messaging, getToken, onMessage, vapidKey };
