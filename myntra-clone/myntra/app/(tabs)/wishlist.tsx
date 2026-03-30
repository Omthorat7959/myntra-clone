import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext"; // ✅ ADDED
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme(); // ✅ ADDED
  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(`${BASE_URL}/wishlist/${user._id}`);
        setwishlist(bag.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(`${BASE_URL}/wishlist/${itemid}`);
      fetchproduct();
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color="#ff3f6c" />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your wishlist
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#ff3f6c" />
      </View>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Your wishlist is empty!
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.loginButtonText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wishlist</Text>
        <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
          {wishlist.length} item(s)
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {wishlist?.map((item: any) => (
          <View key={item._id} style={[styles.wishlistItem, { backgroundColor: theme.card }]}>
            <Image
              source={{ uri: item.productId.images[0] }}
              style={styles.itemImage}
            />
            <View style={[styles.itemInfo, { backgroundColor: theme.card }]}>
              <Text style={[styles.brandName, { color: theme.textSecondary }]}>
                {item.productId.brand}
              </Text>
              <Text style={[styles.itemName, { color: theme.text }]}>
                {item.productId.name}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: theme.text }]}>
                  ₹{item.productId.price}
                </Text>
                <Text style={styles.discount}>
                  {item.productId.discount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handledelete(item._id)}
            >
              <Trash2 size={24} color="#ff3f6c" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  itemCount: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  itemImage: {
    width: 100,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 15,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
  },
});