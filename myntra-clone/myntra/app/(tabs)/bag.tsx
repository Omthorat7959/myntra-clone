import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Bookmark, ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";
import { useFocusEffect } from "expo-router";
import { notifyCartAbandonment, cancelAllNotifications } from "@/utils/notifications";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function Bag() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [bag, setbag] = useState<any>([]);
  const [saved, setSaved] = useState<any>([]); // ✅ saved for later
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchBag();
    fetchSaved();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cancelAllNotifications();
      return () => {
        if (bag && bag.length > 0) {
          notifyCartAbandonment();
        }
      };
    }, [bag])
  );

  const fetchBag = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/bag/${user._id}`);
      const validItems = res.data.filter((item: any) => item.productId !== null);
      setbag(validItems);
    } catch (error) {
      console.log(error);
      setError("Failed to load bag. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch saved for later items
  const fetchSaved = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE_URL}/bag/saved/${user._id}`);
      const validItems = res.data.filter((item: any) => item.productId !== null);
      setSaved(validItems);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (itemid: any) => {
    try {
      await axios.delete(`${BASE_URL}/bag/${itemid}`);
      fetchBag();
      fetchSaved();
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantityChange = async (itemid: any, type: "inc" | "dec", currentQty: number) => {
    if (type === "dec" && currentQty <= 1) {
      handleDelete(itemid);
      return;
    }
    try {
      const newQty = type === "inc" ? currentQty + 1 : currentQty - 1;
      await axios.put(`${BASE_URL}/bag/${itemid}`, { quantity: newQty });
      fetchBag();
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Move item to saved for later
  const handleSaveForLater = async (itemid: any) => {
    try {
      await axios.put(`${BASE_URL}/bag/save/${itemid}`);
      fetchBag();
      fetchSaved();
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Move item back to cart
  const handleMoveToCart = async (itemid: any) => {
    try {
      await axios.put(`${BASE_URL}/bag/movetocart/${itemid}`);
      fetchBag();
      fetchSaved();
    } catch (error) {
      console.log(error);
    }
  };

  // Not logged in
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your bag
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
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
          Loading your bag...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBag}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!bag || bag.length === 0 && saved.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your bag is empty!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add items to get started
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

  const total = bag.reduce(
    (sum: any, item: any) => sum + (item.productId?.price ?? 0) * item.quantity, 0
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Bag</Text>
        <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
          {bag.length} item(s)
        </Text>
      </View>

      <ScrollView style={styles.content}>

        {/* ✅ Active Cart Items */}
        {bag.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🛒 Cart Items ({bag.length})
            </Text>
            {bag.map((item: any) => (
              <View key={item._id} style={[styles.bagItem, { backgroundColor: theme.card }]}>
                <Image
                  source={{ uri: item.productId?.images?.[0] }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={[styles.itemInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.brandName, { color: theme.textSecondary }]}>
                    {item.productId?.brand}
                  </Text>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {item.productId?.name}
                  </Text>
                  <Text style={[styles.itemSize, { color: theme.textMuted }]}>
                    Size: {item.size}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>
                    ₹{item.productId?.price}
                  </Text>

                  {/* Quantity Controls */}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[styles.quantityButton, {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      }]}
                      onPress={() => handleQuantityChange(item._id, "dec", item.quantity)}
                    >
                      <Minus size={16} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantity, { color: theme.text }]}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={[styles.quantityButton, {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      }]}
                      onPress={() => handleQuantityChange(item._id, "inc", item.quantity)}
                    >
                      <Plus size={16} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Trash2 size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* ✅ Save for Later Button */}
                  <TouchableOpacity
                    style={[styles.saveButton, { borderColor: theme.border }]}
                    onPress={() => handleSaveForLater(item._id)}
                  >
                    <Bookmark size={14} color={theme.primary} />
                    <Text style={[styles.saveButtonText, { color: theme.primary }]}>
                      Save for Later
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Price Breakdown — only for active cart */}
        {bag.length > 0 && (
          <View style={[styles.priceBreakdown, { backgroundColor: theme.card }]}>
            <Text style={[styles.priceBreakdownTitle, { color: theme.text }]}>
              Price Details
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Price ({bag.length} items)
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>₹{total}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Delivery Charges
              </Text>
              <Text style={styles.freeDelivery}>FREE</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
              <Text style={[styles.totalAmount, { color: theme.text }]}>₹{total}</Text>
            </View>
          </View>
        )}

        {/* ✅ Saved for Later Section */}
        {saved.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🔖 Saved for Later ({saved.length})
            </Text>
            {saved.map((item: any) => (
              <View key={item._id} style={[styles.bagItem, {
                backgroundColor: theme.card,
                opacity: 0.85,
              }]}>
                <Image
                  source={{ uri: item.productId?.images?.[0] }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={[styles.itemInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.brandName, { color: theme.textSecondary }]}>
                    {item.productId?.brand}
                  </Text>
                  <Text style={[styles.itemName, { color: theme.text }]}>
                    {item.productId?.name}
                  </Text>
                  <Text style={[styles.itemSize, { color: theme.textMuted }]}>
                    Size: {item.size}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>
                    ₹{item.productId?.price}
                  </Text>

                  <View style={styles.savedActions}>
                    {/* ✅ Move to Cart Button */}
                    <TouchableOpacity
                      style={styles.moveToCartButton}
                      onPress={() => handleMoveToCart(item._id)}
                    >
                      <ShoppingCart size={14} color="#fff" />
                      <Text style={styles.moveToCartText}>Move to Cart</Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Trash2 size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

      </ScrollView>

      {/* Footer — only show if cart has items */}
      {bag.length > 0 && (
        <View style={[styles.footer, {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        }]}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total: ₹{total}</Text>
            <Text style={[styles.itemCountSmall, { color: theme.textSecondary }]}>
              {bag.length} item(s)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 16, color: "#ff3f6c", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1 },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  itemCount: { fontSize: 14, marginTop: 4 },
  itemCountSmall: { fontSize: 13 },
  content: { flex: 1, padding: 15 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, marginBottom: 25 },
  loginButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, marginTop: 5 }, // ✅
  bagItem: { flexDirection: "row", borderRadius: 10, marginBottom: 15, elevation: 3, overflow: "hidden" },
  itemImage: { width: 110, height: 130 },
  itemInfo: { flex: 1, padding: 12 },
  brandName: { fontSize: 13, marginBottom: 3 },
  itemName: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  itemSize: { fontSize: 13, marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  quantity: { marginHorizontal: 12, fontSize: 16, fontWeight: "bold" },
  removeButton: { marginLeft: "auto", padding: 5 },
  saveButton: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, alignSelf: "flex-start" }, // ✅
  saveButtonText: { fontSize: 12, marginLeft: 5, fontWeight: "600" }, // ✅
  savedActions: { flexDirection: "row", alignItems: "center", marginTop: 8 }, // ✅
  moveToCartButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#ff3f6c", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 }, // ✅
  moveToCartText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 5 }, // ✅
  priceBreakdown: { borderRadius: 10, padding: 15, marginBottom: 15 },
  priceBreakdownTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14 },
  freeDelivery: { fontSize: 14, color: "#388e3c", fontWeight: "bold" },
  divider: { height: 1, marginVertical: 10 },
  footer: { padding: 15, borderTopWidth: 1 },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: { backgroundColor: "#ff3f6c", padding: 15, borderRadius: 10, alignItems: "center" },
  checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});