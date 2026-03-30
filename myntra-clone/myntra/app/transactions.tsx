import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
  Alert, Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft, Download, Filter,
  CreditCard, CheckCircle, Clock,
  RefreshCw, ChevronDown,
} from "lucide-react-native";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

const FILTER_TYPES = ["All", "Card", "COD", "Refund"];
const SORT_OPTIONS = ["Newest", "Oldest", "Highest Amount", "Lowest Amount"];

export default function Transactions() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Newest");
  const [showSort, setShowSort] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, selectedType, selectedSort]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/transactions/user/${user._id}`);
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
      setError("Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...transactions];

    if (selectedType !== "All") {
      result = result.filter(t => t.paymentMethod === selectedType);
    }

    if (selectedSort === "Newest") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (selectedSort === "Oldest") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (selectedSort === "Highest Amount") {
      result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (selectedSort === "Lowest Amount") {
      result.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    }

    setFiltered(result);
  };

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      setExporting(true);
      const url = `${BASE_URL}/transactions/export/csv/${user._id}`;
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export transactions");
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "#00b852";
      case "processing": return "#f59e0b";
      case "refunded": return "#3b82f6";
      case "failed": return "#ef4444";
      default: return "#00b852";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return <CheckCircle size={14} color="#00b852" />;
      case "processing": return <Clock size={14} color="#f59e0b" />;
      case "refunded": return <RefreshCw size={14} color="#3b82f6" />;
      default: return <CheckCircle size={14} color="#00b852" />;
    }
  };

  const totalSpent = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Not logged in
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            My Transactions
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <CreditCard size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.actionBtnText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTransactions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My Transactions
        </Text>
        <TouchableOpacity onPress={handleExportCSV} disabled={exporting}>
          {exporting
            ? <ActivityIndicator size="small" color={theme.primary} />
            : <Download size={24} color={theme.primary} />
          }
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>₹{totalSpent.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryCount}>{filtered.length}</Text>
          <Text style={styles.summaryCountLabel}>Transactions</Text>
        </View>
      </View>

      {/* Filter & Sort Bar */}
      <View style={[styles.filterBar, {
        backgroundColor: theme.card,
        borderBottomColor: theme.border,
      }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {FILTER_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                { borderColor: theme.border, backgroundColor: theme.surface },
                selectedType === type && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.filterChipText,
                { color: theme.textSecondary },
                selectedType === type && { color: "#fff" },
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Button */}
        <TouchableOpacity
          style={[styles.sortButton, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }]}
          onPress={() => setShowSort(!showSort)}
        >
          <Filter size={14} color={theme.textSecondary} />
          <Text style={[styles.sortButtonText, { color: theme.textSecondary }]}>
            {selectedSort}
          </Text>
          <ChevronDown size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      {showSort && (
        <View style={[styles.sortDropdown, {
          backgroundColor: theme.card,
          borderColor: theme.border,
        }]}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortOption, { borderBottomColor: theme.border }]}
              onPress={() => { setSelectedSort(option); setShowSort(false); }}
            >
              <Text style={[
                styles.sortOptionText,
                { color: theme.text },
                selectedSort === option && { color: theme.primary, fontWeight: "bold" },
              ]}>
                {option}
              </Text>
              {selectedSort === option && (
                <CheckCircle size={16} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Transactions List */}
      <ScrollView style={styles.content}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <CreditCard size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {selectedType !== "All"
                ? `No ${selectedType} transactions found`
                : "Place an order to see transactions here"
              }
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.actionBtnText}>START SHOPPING</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((transaction) => (
            <View
              key={transaction._id}
              style={[styles.transactionCard, { backgroundColor: theme.card }]}
            >
              {/* Transaction Header */}
              <View style={styles.transactionHeader}>
                <View style={[styles.paymentIconBg, { backgroundColor: theme.primaryLight }]}>
                  <CreditCard size={20} color={theme.primary} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionId, { color: theme.text }]}>
                    Order #{transaction.orderId}
                  </Text>
                  <Text style={[styles.transactionDate, { color: theme.textMuted }]}>
                    {new Date(transaction.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: theme.text }]}>
                  ₹{(transaction.amount || 0).toLocaleString()}
                </Text>
              </View>

              {/* Transaction Details Row */}
              <View style={[styles.detailsRow, { borderTopColor: theme.border }]}>
                {/* Payment Method */}
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Payment
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {transaction.paymentMethod || "Card"}
                  </Text>
                </View>

                {/* Divider */}
                <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                {/* Items */}
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Items
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {transaction.items}
                  </Text>
                </View>

                {/* Divider */}
                <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                {/* Status */}
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                    Status
                  </Text>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(transaction.status)}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.status) }
                    ]}>
                      {transaction.status || "Completed"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Receipt Button */}
              <TouchableOpacity
                style={[styles.receiptBtn, { borderTopColor: theme.border }]}
                onPress={() => Alert.alert(
                  `Receipt - Order #${transaction.orderId}`,
                  `💳 Payment: ${transaction.paymentMethod || "Card"}\n` +
                  `💰 Amount: ₹${transaction.amount || 0}\n` +
                  `📦 Items: ${transaction.items}\n` +
                  `📅 Date: ${new Date(transaction.date).toLocaleDateString("en-IN")}\n` +
                  `✅ Status: ${transaction.status || "Completed"}\n` +
                  `📍 Shipped to: ${transaction.shippingAddress || "N/A"}`,
                  [{ text: "Close", style: "cancel" }]
                )}
              >
                <Download size={14} color={theme.primary} />
                <Text style={[styles.receiptBtnText, { color: theme.primary }]}>
                  View Receipt
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
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

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    padding: 15, paddingTop: 50, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  // Summary Card
  summaryCard: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", margin: 15,
    padding: 20, borderRadius: 15,
  },
  summaryLeft: {},
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 4 },
  summaryAmount: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  summaryRight: { alignItems: "center" },
  summaryCount: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  summaryCountLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },

  // Filter Bar
  filterBar: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  filterScroll: { flex: 1 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  filterChipText: { fontSize: 13, fontWeight: "500" },
  sortButton: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 8, borderWidth: 1, gap: 4, marginLeft: 8,
  },
  sortButtonText: { fontSize: 12 },

  // Sort Dropdown
  sortDropdown: {
    position: "absolute", right: 15, top: 195,
    zIndex: 100, borderRadius: 10, borderWidth: 1,
    minWidth: 180, elevation: 10,
  },
  sortOption: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 14, borderBottomWidth: 1,
  },
  sortOptionText: { fontSize: 14 },

  // Content
  content: { flex: 1, padding: 15 },

  // Empty State
  emptyState: {
    alignItems: "center", justifyContent: "center",
    padding: 30, marginTop: 30,
  },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginTop: 15, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", marginBottom: 25 },
  actionBtn: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 40, paddingVertical: 14, borderRadius: 10,
  },
  actionBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Transaction Card
  transactionCard: {
    borderRadius: 12, marginBottom: 15, overflow: "hidden", elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row", alignItems: "center", padding: 15,
  },
  paymentIconBg: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  transactionInfo: { flex: 1 },
  transactionId: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  transactionDate: { fontSize: 12 },
  transactionAmount: { fontSize: 18, fontWeight: "bold" },

  // Details Row
  detailsRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingVertical: 12, borderTopWidth: 1,
  },
  detailItem: { alignItems: "center", flex: 1 },
  detailLabel: { fontSize: 11, marginBottom: 4 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  verticalDivider: { width: 1, marginVertical: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },

  // Receipt Button
  receiptBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", padding: 12,
    borderTopWidth: 1, gap: 6,
  },
  receiptBtnText: { fontSize: 14, fontWeight: "600" },
});