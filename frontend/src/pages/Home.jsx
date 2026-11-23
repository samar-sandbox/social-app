import { useEffect } from "react";
import { register } from "firebase/messaging";
import { messaging } from "../firebase";

export default function Home() {
  const registerFID = () => {
    console.log("Registering FID...");

    register(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    }).catch((err) => {
      console.error("An error occurred while registering", err);
    });
  };

  useEffect(() => {
    const permission = Notification.permission;

    if (permission !== "granted") {
      console.log("Requesting permission...");

      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
          registerFID();
        } else {
          console.log("Notification permission denied");
        }
      });
    } else {
      console.log("Notification permission granted");
      registerFID();
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-display text-4xl">Social App</h1>
    </div>
  );
}
