import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const KEY = "recently_viewed";
const MAX_ITEMS = 10;

export const saveRecentlyViewed = async (product: any) => {
  try {
    const existing = await getRecentlyViewed();
    const filtered = existing.filter((p: any) => p._id !== product._id);
    const updated = [
      { ...product, viewedAt: new Date().toISOString() },
      ...filtered
    ].slice(0, MAX_ITEMS);

    if (Platform.OS === "web") {
      localStorage.setItem(KEY, JSON.stringify(updated));
    } else {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.log("Error saving recently viewed:", error);
  }
};

export const getRecentlyViewed = async (): Promise<any[]> => {
  try {
    let data;
    if (Platform.OS === "web") {
      data = localStorage.getItem(KEY);
    } else {
      data = await AsyncStorage.getItem(KEY);
    }
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log("Error getting recently viewed:", error);
    return [];
  }
};

export const removeRecentlyViewed = async (productId: string) => {
  try {
    const existing = await getRecentlyViewed();
    const updated = existing.filter((p: any) => p._id !== productId);
    if (Platform.OS === "web") {
      localStorage.setItem(KEY, JSON.stringify(updated));
    } else {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.log("Error removing recently viewed:", error);
  }
};

export const clearRecentlyViewed = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(KEY);
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch (error) {
    console.log("Error clearing recently viewed:", error);
  }
};

// Get time ago string
export const getTimeAgo = (isoString: string): string => {
  const now = new Date();
  const viewed = new Date(isoString);
  const diffMs = now.getTime() - viewed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};