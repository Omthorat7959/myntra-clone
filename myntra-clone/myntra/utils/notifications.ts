import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

// How notifications appear when app is in foreground
if (Platform.OS !== "web") { // ✅ wrap this too
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Request permission and get push token
export const registerForPushNotifications = async (userId: string) => {
  if (Platform.OS === "web") {
    console.log("Push notifications not supported on web");
    return null;
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for push notifications");
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission not granted for notifications");
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    console.log("Push token:", token.data);

    await saveTokenToBackend(userId, token.data);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ff3f6c",
      });

      await Notifications.setNotificationChannelAsync("orders", {
        name: "Order Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ff3f6c",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("offers", {
        name: "Offers & Promotions",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#ff3f6c",
      });
    }

    return token.data;
  } catch (error) {
    console.log("Error registering for notifications:", error);
    return null;
  }
};

// Save token to backend
export const saveTokenToBackend = async (userId: string, token: string) => {
  try {
    await axios.post(`${BASE_URL}/notifications/register`, {
      userId,
      token,
      platform: Platform.OS,
    });
    console.log("Token saved to backend ✅");
  } catch (error) {
    console.log("Error saving token:", error);
  }
};

// Send immediate local notification
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  channelId: string = "default"
) => {
  if (Platform.OS === "web") return; // ✅
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
    },
    trigger: null,
  });
};

// Schedule notification for later
export const scheduleNotification = async (
  title: string,
  body: string,
  seconds: number,
  data?: any
) => {
  if (Platform.OS === "web") return; // ✅
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
    },
    trigger: { seconds },
  });
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  if (Platform.OS === "web") return; // ✅ FIXED — this was missing!
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Predefined notification types
export const notifyOrderPlaced = async () => {
  await sendLocalNotification(
    "🎉 Order Placed Successfully!",
    "Your order has been confirmed. We'll notify you when it ships!",
    { type: "order_placed" }
  );
};

export const notifyOrderShipped = async (orderId: string) => {
  await sendLocalNotification(
    "📦 Your Order is on the Way!",
    `Order #${orderId} has been shipped. Expected delivery in 5-7 days.`,
    { type: "order_shipped", orderId }
  );
};

export const notifyCartAbandonment = async () => {
  await scheduleNotification(
    "🛒 Items waiting in your bag!",
    "You left some items in your bag. Complete your purchase before they sell out!",
    3600,
    { type: "cart_abandonment" }
  );
};

export const notifyOffer = async (offer: string) => {
  await sendLocalNotification(
    "🔥 Special Offer Just for You!",
    offer,
    { type: "offer" }
  );
};

export const schedulePromoReminder = async () => {
  await scheduleNotification(
    "✨ Exclusive Deals Await!",
    "Check out today's trending fashion and grab up to 70% off!",
    86400,
    { type: "promo_reminder" }
  );
};