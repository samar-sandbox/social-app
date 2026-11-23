import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, onRegistered } from "firebase/messaging";
import { axiosInstance } from "./axios";
import { firebaseConfig } from "./firebase-config";

async function sendRegistrationToServer(installationId) {
  console.log("Sending installation ID to server:", installationId);

  try {
    await axiosInstance.post("/auth/firebase-installation", {
      installationId,
    });
  } catch (err) {
    console.error("Failed to send installation ID to server", err);
  }
}

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

onRegistered(messaging, (installationId) =>
  sendRegistrationToServer(installationId),
);

onMessage(messaging, ({ notification }) => {
  console.log("Message received:", notification);

  new Notification(notification.title, {
    body: notification.body,
  });
});

export { messaging };
