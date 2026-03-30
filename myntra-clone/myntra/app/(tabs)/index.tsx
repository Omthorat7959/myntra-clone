import {
  ScrollView, View, Text, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator, Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  removeRecentlyViewed,
  getTimeAgo,
} from "@/utils/recentlyViewed";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

const deals = [
  { id: 1, title: "Under ₹599", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop" },
  { id: 2, title: "40-70% Off", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop" },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleProductPress = (productId: string) => {
    if (!user) {
      router.push("/(auth)/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${BASE_URL}/category`),
          axios.get(`${BASE_URL}/product`),
        ]);
        setcategories(catRes.data);
        setproduct(prodRes.data);
      } catch (error) {
        console.log(error);
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadRecentlyViewed = async () => {
        const items = await getRecentlyViewed();
        setRecentlyViewed(items);
      };
      loadRecentlyViewed();
    }, [])
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <View style={[styles.header, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <Text style={[styles.logo, { color: theme.primary }]}>MYNTRA</Text>
        <View style={styles.headerRight}>
          <ThemeToggle />
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* BANNER */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop" }}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* CATEGORIES */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            SHOP BY CATEGORY
          </Text>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => router.push("/(tabs)/categories")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
          ) : !categories || categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No categories available
            </Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryCard}
                onPress={() => router.push("/(tabs)/categories")}
              >
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* DEALS */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            DEALS OF THE DAY
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.recentTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                RECENTLY VIEWED
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{recentlyViewed.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await clearRecentlyViewed();
                setRecentlyViewed([]);
              }}
            >
              <Text style={[styles.clearText, { color: theme.textMuted }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentScroll}
          >
            {recentlyViewed.map((item: any) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.recentCard, {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }]}
                onPress={() => handleProductPress(item._id)}
                activeOpacity={0.85}
              >
                <View style={styles.recentImageContainer}>
                  <Image
                    source={{ uri: item.images?.[0] }}
                    style={styles.recentImage}
                    resizeMode="cover"
                  />
                  {item.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{item.discount}</Text>
                    </View>
                  )}
                  {item.viewedAt && new Date().getTime() - new Date(item.viewedAt).getTime() < 3600000 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={async () => {
                      await removeRecentlyViewed(item._id);
                      setRecentlyViewed(prev => prev.filter(p => p._id !== item._id));
                    }}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.recentInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.recentBrand, { color: theme.textMuted }]} numberOfLines={1}>
                    {item.brand}
                  </Text>
                  <Text style={[styles.recentName, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.recentPrice, { color: theme.text }]}>
                    ₹{item.price}
                  </Text>
                  {item.viewedAt && (
                    <Text style={[styles.timeAgo, { color: theme.textMuted }]}>
                      🕐 {getTimeAgo(item.viewedAt)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* TRENDING NOW */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            TRENDING NOW
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.emptyText, { color: theme.primary }]}>{error}</Text>
        ) : !product || product.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No products available
          </Text>
        ) : (
          <View style={styles.productsGrid}>
            {product.map((item: any) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.productCard, { backgroundColor: theme.card }]}
                onPress={() => handleProductPress(item._id)}
              >
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={[styles.productInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.brandName, { color: theme.textSecondary }]}>
                    {item.brand}
                  </Text>
                  <Text style={[styles.productName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.productPrice, { color: theme.text }]}>
                      ₹{item.price}
                    </Text>
                    <Text style={styles.discount}>{item.discount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 15, paddingTop: 50,
    borderBottomWidth: 1,
  },
  logo: { fontSize: 24, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchButton: { padding: 8 },
  banner: { width: "100%", height: 200 },
  section: { padding: 15 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  viewAll: { flexDirection: "row", alignItems: "center" },
  viewAllText: { color: "#ff3f6c", marginRight: 5 },

  // Categories
  categoriesScroll: { marginHorizontal: -15 },
  categoryCard: { width: 100, marginHorizontal: 8 },
  categoryImage: { width: 100, height: 100, borderRadius: 50 },
  categoryName: { textAlign: "center", marginTop: 8, fontSize: 14 },

  // Deals
  dealsScroll: { marginHorizontal: -15 },
  dealCard: { width: 280, height: 150, marginHorizontal: 8, borderRadius: 10, overflow: "hidden" },
  dealImage: { width: "100%", height: "100%" },
  dealOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)", padding: 15,
  },
  dealTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Recently Viewed
  recentTitleRow: { flexDirection: "row", alignItems: "center" },
  badge: {
    backgroundColor: "#ff3f6c", borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginLeft: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  clearText: { fontSize: 13 },
  recentScroll: { marginHorizontal: -15, paddingLeft: 15 },
  recentCard: {
    width: 145, marginRight: 12, borderRadius: 12,
    overflow: "hidden", borderWidth: 1, elevation: 4,
  },
  recentImageContainer: { position: "relative" },
  recentImage: { width: "100%", height: 165 },
  discountBadge: {
    position: "absolute", bottom: 8, left: 8,
    backgroundColor: "#ff3f6c", paddingHorizontal: 6,
    paddingVertical: 3, borderRadius: 4,
  },
  discountBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  newBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "#00b852", paddingHorizontal: 6,
    paddingVertical: 3, borderRadius: 4,
  },
  newBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  removeBtn: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 22, height: 22, borderRadius: 11,
    justifyContent: "center", alignItems: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  recentInfo: { padding: 8 },
  recentBrand: { fontSize: 11, marginBottom: 2 },
  recentName: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  recentPriceRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  recentPrice: { fontSize: 13, fontWeight: "bold" },
  timeAgo: { fontSize: 10 },

  // Products Grid
  productsGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 },
  productCard: {
    width: "48%", marginHorizontal: "1%", marginBottom: 15,
    borderRadius: 10, elevation: 5,
  },
  productImage: { width: "100%", height: 200, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  productInfo: { padding: 10 },
  brandName: { fontSize: 14, marginBottom: 2 },
  productName: { fontSize: 16, marginBottom: 5 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  productPrice: { fontSize: 16, fontWeight: "bold", marginRight: 8 },
  discount: { fontSize: 14, color: "#ff3f6c", fontWeight: "500" },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  loader: { marginTop: 50 },
});