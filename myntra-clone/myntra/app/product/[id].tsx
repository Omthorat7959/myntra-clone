import { useState, useEffect, useRef } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, ActivityIndicator,
  Platform, Alert, FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { saveRecentlyViewed } from "@/utils/recentlyViewed";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const [product, setproduct] = useState<any>(null);
  const [iswishlist, setiswishlist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]); // ✅

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/product/${id}`);
        setproduct(res.data);
        await saveRecentlyViewed(res.data);

        // ✅ Track view in backend
        await axios.post(`${BASE_URL}/recommendations/track`, {
          userId: user?._id || null,
          productId: id,
          category: res.data.category || "general",
        });

        // ✅ Fetch recommendations
        const recRes = await axios.get(
          `${BASE_URL}/recommendations/${id}${user ? `?userId=${user._id}` : ""}`
        );
        setRecommendations(recRes.data);

      } catch (error) {
        console.log(error);
        setError("Failed to load product. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, [id]);

  useEffect(() => {
    if (product) startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [product]);

  const startAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      if (product && scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  const handleAddwishlist = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    try {
      await axios.post(`${BASE_URL}/wishlist`, {
        userId: user._id,
        productId: id,
      });
      setiswishlist(true);
      router.push("/wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToBag = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (!selectedSize) {
      Alert.alert("Select Size", "Please select a size before adding to bag");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/bag`, {
        userId: user._id,
        productId: id,
        size: selectedSize,
        quantity: 1,
      });
      router.push("/bag");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add to bag");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image: any, index: any) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.productImage, { width }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {product.images.map((_: any, index: any) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.brand, { color: theme.textSecondary }]}>
                {product.brand}
              </Text>
              <Text style={[styles.name, { color: theme.text }]}>
                {product.name}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.wishlistButton, { backgroundColor: theme.surface }]}
              onPress={handleAddwishlist}
            >
              <Heart
                size={24}
                color={iswishlist ? theme.primary : theme.textMuted}
                fill={iswishlist ? theme.primary : "none"}
              />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={[styles.priceContainer, {
            backgroundColor: theme.surface,
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }]}>
            <Text style={[styles.price, { color: theme.text }]}>
              ₹{product.price}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discount}>{product.discount}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {product.description}
          </Text>

          {/* Size Section */}
          <View style={[styles.sizeSection, {
            backgroundColor: theme.surface,
            borderRadius: 10,
            padding: 15,
          }]}>
            <Text style={[styles.sizeTitle, { color: theme.text }]}>
              Select Size
            </Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    selectedSize === size && styles.selectedSize,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeText,
                    { color: theme.text },
                    selectedSize === size && styles.selectedSizeText,
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ✅ You May Also Like Carousel */}
          {recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={[styles.recommendationsTitle, { color: theme.text }]}>
                ✨ You May Also Like
              </Text>
              <FlatList
                data={recommendations}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingRight: 15 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.recCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push(`/product/${item._id}`)}
                  >
                    <Image
                      source={{ uri: item.images?.[0] }}
                      style={styles.recImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recInfo}>
                      <Text
                        style={[styles.recBrand, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        {item.brand}
                      </Text>
                      <Text
                        style={[styles.recName, { color: theme.text }]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.recPrice, { color: theme.text }]}>
                        ₹{item.price}
                      </Text>
                      {item.discount && (
                        <Text style={styles.recDiscount}>{item.discount}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, {
        backgroundColor: theme.card,
        borderTopColor: theme.border,
      }]}>
        <TouchableOpacity
          style={[styles.addToBagButton, loading && styles.addToBagDisabled]}
          onPress={handleAddToBag}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <ShoppingBag size={20} color="#fff" />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#ff3f6c", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  carouselContainer: { position: "relative" },
  productImage: { height: 400 },
  pagination: { position: "absolute", bottom: 16, flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center" },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)", marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: "#fff", width: 10, height: 10, borderRadius: 5 },
  backButton: { position: "absolute", top: 50, left: 15, backgroundColor: "rgba(0,0,0,0.4)", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  backButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  headerLeft: { flex: 1, marginRight: 10 },
  brand: { fontSize: 14, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: "bold" },
  wishlistButton: { padding: 10, borderRadius: 25, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  priceContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 22, fontWeight: "bold" },
  discountBadge: { backgroundColor: "#ff3f6c", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  discount: { fontSize: 14, color: "#fff", fontWeight: "bold" },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 15 },
  sizeSection: { marginBottom: 20 },
  sizeTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  selectedSize: { borderColor: "#ff3f6c", backgroundColor: "#fff4f4" },
  sizeText: { fontSize: 15 },
  selectedSizeText: { color: "#ff3f6c", fontWeight: "bold" },
  // ✅ Recommendations
  recommendationsSection: { marginTop: 10, marginBottom: 20 },
  recommendationsTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  recCard: { width: 160, borderRadius: 12, marginRight: 12, overflow: "hidden", elevation: 3 },
  recImage: { width: 160, height: 180 },
  recInfo: { padding: 10 },
  recBrand: { fontSize: 11, marginBottom: 3 },
  recName: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  recPrice: { fontSize: 14, fontWeight: "bold" },
  recDiscount: { fontSize: 12, color: "#ff3f6c", fontWeight: "bold" },
  footer: { padding: 15, borderTopWidth: 1 },
  addToBagButton: { backgroundColor: "#ff3f6c", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 10, gap: 10 },
  addToBagDisabled: { backgroundColor: "#ffaab9" },
  addToBagText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});