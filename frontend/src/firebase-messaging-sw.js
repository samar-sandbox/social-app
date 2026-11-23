import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { firebaseConfig } from "./firebase-config";

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

onBackgroundMessage(messaging, ({ notification }) => {
  console.log("Received background message: ", notification);
});
