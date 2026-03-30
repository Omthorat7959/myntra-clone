import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Package, ChevronRight, MapPin, Truck, CreditCard } from "lucide-react-native";
import React from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function Orders() {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [orders, setOrders] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/Order/user/${user._id}`);
      setOrders(res.data);
    } catch (error) {
      console.log(error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
        </View>
        <View style={styles.emptyState}>
          <Package size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view orders
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.shopButtonText}>LOGIN</Text>
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
          Loading your orders...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
        </View>
        <View style={styles.emptyState}>
          <Package size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your orders will appear here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.shopButtonText}>START SHOPPING</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Orders</Text>
        <Text style={[styles.orderCount, { color: theme.textSecondary }]}>
          {orders.length} order(s)
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order: any) => (
          <View key={order._id} style={[styles.orderCard, { backgroundColor: theme.card }]}>

            {/* Order Header */}
            <TouchableOpacity
              style={[styles.orderHeader, { borderBottomColor: theme.border }]}
              onPress={() => toggleOrderDetails(order._id)}
            >
              <View>
                <Text style={[styles.orderId, { color: theme.text }]}>
                  Order #{order._id?.slice(-8).toUpperCase()}
                </Text>
                <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </Text>
              </View>
              <View style={[styles.statusContainer, { backgroundColor: theme.successLight }]}>
                <Package size={16} color={theme.success} />
                <Text style={[styles.orderStatus, { color: theme.success }]}>
                  {order.status || "Processing"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Order Items */}
            <View style={styles.itemsContainer}>
              {order.items?.filter((item: any) => item.productId !== null).map((item: any) => (
                <View key={item._id} style={styles.orderItem}>
                  <Image
                    source={{ uri: item.productId?.images?.[0] }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
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
                  </View>
                </View>
              ))}
            </View>

            {/* Expanded Details */}
            {expandedOrder === order._id && (
              <View style={[styles.orderDetails, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <MapPin size={20} color={theme.primary} />
                    <Text style={[styles.detailTitle, { color: theme.text }]}>
                      Shipping Address
                    </Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {order.shippingAddress}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <CreditCard size={20} color={theme.primary} />
                    <Text style={[styles.detailTitle, { color: theme.text }]}>
                      Payment Method
                    </Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {order.paymentMethod}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Truck size={20} color={theme.primary} />
                    <Text style={[styles.detailTitle, { color: theme.text }]}>
                      Delivery Status
                    </Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    Estimated delivery: 5-7 business days
                  </Text>
                </View>
              </View>
            )}

            {/* Order Footer */}
            <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                  Order Total
                </Text>
                <Text style={[styles.totalAmount, { color: theme.text }]}>
                  ₹{order.totalAmount}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => toggleOrderDetails(order._id)}
              >
                <Text style={styles.detailsButtonText}>
                  {expandedOrder === order._id ? "Hide Details" : "View Details"}
                </Text>
                <ChevronRight size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16 },
  errorText: { fontSize: 16, color: "#ff3f6c", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  orderCount: { fontSize: 14, marginTop: 4 },
  content: { flex: 1, padding: 15 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, marginBottom: 25 },
  shopButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
  shopButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  orderCard: { borderRadius: 10, marginBottom: 15, elevation: 3, overflow: "hidden" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1 },
  orderId: { fontSize: 16, fontWeight: "bold" },
  orderDate: { fontSize: 14, marginTop: 2 },
  statusContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  orderStatus: { fontSize: 14, marginLeft: 5 },
  itemsContainer: { padding: 15 },
  orderItem: { flexDirection: "row", marginBottom: 15 },
  itemImage: { width: 80, height: 100, borderRadius: 5 },
  itemInfo: { flex: 1, marginLeft: 15 },
  brandName: { fontSize: 14, marginBottom: 2 },
  itemName: { fontSize: 16, marginBottom: 2 },
  itemSize: { fontSize: 14, marginBottom: 2 },
  itemPrice: { fontSize: 16, fontWeight: "bold" },
  orderDetails: { padding: 15, borderTopWidth: 1 },
  detailSection: { marginBottom: 15 },
  detailHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  detailText: { fontSize: 14, lineHeight: 20 },
  orderFooter: { padding: 15, borderTopWidth: 1 },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  totalLabel: { fontSize: 16 },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  detailsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  detailsButtonText: { fontSize: 16, color: "#ff3f6c", marginRight: 5 },
});