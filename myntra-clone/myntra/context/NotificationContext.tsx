import React, { createContext, useContext, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import {
  registerForPushNotifications,
  schedulePromoReminder,
} from "@/utils/notifications";
import { useAuth } from "@/context/AuthContext";

type NotificationContextType = {
  sendOrderNotification: () => void;
  sendOfferNotification: (offer: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  sendOrderNotification: () => {},
  sendOfferNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (user && Platform.OS !== "web") {
      registerForPushNotifications(user._id);
      schedulePromoReminder();
    }
  }, [user]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Fires when notification arrives while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Fires when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped:", data);

        if (data.type === "order_placed" || data.type === "order_shipped") {
          router.push("/orders");
        } else if (data.type === "cart_abandonment") {
          router.push("/bag");
        } else if (data.type === "offer" || data.type === "promo_reminder") {
          router.push("/(tabs)");
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const sendOrderNotification = async () => {
    const { notifyOrderPlaced } = await import("@/utils/notifications");
    await notifyOrderPlaced();
  };

  const sendOfferNotification = async (offer: string) => {
    const { notifyOffer } = await import("@/utils/notifications");
    await notifyOffer(offer);
  };

  return (
    <NotificationContext.Provider value={{
      sendOrderNotification,
      sendOfferNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);