import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function TabTwoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cat = await axios.get(`${BASE_URL}/category`);
      setcategories(cat.data);
    } catch (error) {
      console.log(error);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
          Loading Categories...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!categories) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Categories not found</Text>
      </View>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filtercategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((subcategory: any) =>
        subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      category.productId.some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;

  const renderProducts = (products: any) => {
    if (!products || products.length === 0) {
      return (
        <View style={styles.noProductsContainer}>
          <Text style={[styles.noProductsText, { color: theme.textSecondary }]}>
            No products found
          </Text>
        </View>
      );
    }
    return products?.map((product: any) => (
      <TouchableOpacity
        key={product._id}
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <Image source={{ uri: product.images[0] }} style={styles.productImage} />
        <View style={[styles.productInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.brandName, { color: theme.textSecondary }]}>
            {product.brand}
          </Text>
          <Text style={[styles.productName, { color: theme.text }]}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.text }]}>
              ₹{product.price}
            </Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Categories
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.inputBg }]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.inputText }]}
            placeholder="Search for products, brands and more"
            placeholderTextColor={theme.inputPlaceholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        {/* Categories Grid */}
        {!selectedCategory && (
          <View style={styles.categoriesGrid}>
            {filtercategories?.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={[styles.categoryCard, { backgroundColor: theme.card }]}
                onPress={() => handleCategorySelect(category._id)}
              >
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                <View style={[styles.categoryInfo, { backgroundColor: theme.card }]}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {category.name}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.subcategories}>
                      {category?.subcategory?.map((sub: any, index: any) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.subcategoryTag, { backgroundColor: theme.surface }]}
                          onPress={() => handleSubcategorySelect(sub)}
                        >
                          <Text style={[styles.subcategoryText, { color: theme.textSecondary }]}>
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Detail */}
        {selectedcategorydata && (
          <View style={[styles.categoryDetail, { backgroundColor: theme.background }]}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>← Back to Categories</Text>
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>
                {selectedcategorydata.name}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {selectedcategorydata.subcategory.map((sub: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryButton,
                    { backgroundColor: theme.surface },
                    selectedSubcategory === sub && styles.selectedSubcategory,
                  ]}
                  onPress={() => handleSubcategorySelect(sub)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      { color: theme.text },
                      selectedSubcategory === sub && styles.selectedSubcategoryText,
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.productsGrid}>
              {renderProducts(selectedcategorydata?.productId)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { marginTop: 10, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, color: "#ff3f6c", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#ff3f6c", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  noProductsContainer: { flex: 1, alignItems: "center", padding: 20 },
  noProductsText: { fontSize: 16 },
  container: { flex: 1 },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  searchContainer: { padding: 15, borderBottomWidth: 1 },
  searchInputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, padding: 10 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  content: { flex: 1 },
  categoriesGrid: { padding: 15 },
  categoryCard: { borderRadius: 10, marginBottom: 15, elevation: 5, overflow: "hidden" },
  categoryImage: { width: "100%", height: 150 },
  categoryInfo: { padding: 15 },
  categoryName: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  subcategories: { flexDirection: "row", flexWrap: "wrap" },
  subcategoryTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8, marginBottom: 8 },
  subcategoryText: { fontSize: 14 },
  categoryDetail: { flex: 1, padding: 15 },
  categoryHeader: { marginBottom: 15 },
  backButton: { marginBottom: 10 },
  backButtonText: { color: "#ff3f6c", fontSize: 16 },
  categoryTitle: { fontSize: 24, fontWeight: "bold" },
  subcategoriesScroll: { marginBottom: 15 },
  subcategoryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  selectedSubcategory: { backgroundColor: "#ff3f6c" },
  subcategoryButtonText: { fontSize: 14 },
  selectedSubcategoryText: { color: "#fff" },
  productsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: "48%", borderRadius: 10, marginBottom: 15, elevation: 5, overflow: "hidden" },
  productImage: { width: "100%", height: 200, resizeMode: "cover" },
  productInfo: { padding: 10 },
  brandName: { fontSize: 14, marginBottom: 4 },
  productName: { fontSize: 16, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  price: { fontSize: 16, fontWeight: "bold", marginRight: 8 },
  discount: { fontSize: 14, color: "#ff3f6c" },
});