import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  Alert, Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext"; // ✅ ADDED

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { sendOrderNotification } = useNotifications(); // ✅ ADDED

  const [address, setAddress] = useState({
    fullName: "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "India",
  });

  const [payment, setPayment] = useState({
    cardNumber: "", expiry: "", cvv: "",
  });

  const validateForm = () => {
    if (!address.fullName.trim()) { Alert.alert("Error", "Please enter your full name"); return false; }
    if (!address.line1.trim()) { Alert.alert("Error", "Please enter your address"); return false; }
    if (!address.city.trim()) { Alert.alert("Error", "Please enter your city"); return false; }
    if (!address.pincode.trim()) { Alert.alert("Error", "Please enter your pincode"); return false; }
    if (!payment.cardNumber.trim()) { Alert.alert("Error", "Please enter card number"); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (!validateForm()) return;

    const shippingAddress = `${address.fullName}, ${address.line1}, ${address.line2}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/Order/create/${user._id}`, {
        shippingAddress,
        paymentMethod: "Card",
      });

      await sendOrderNotification(); // ✅ ADDED — fires notification after order

      router.replace("/orders");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: theme.headerBg,
        borderBottomColor: theme.border,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Shipping Address
            </Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBg,
                color: theme.inputText,
                borderColor: theme.border,
              }]}
              placeholder="Full Name *"
              placeholderTextColor={theme.inputPlaceholder}
              value={address.fullName}
              onChangeText={(t) => setAddress({ ...address, fullName: t })}
            />
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBg,
                color: theme.inputText,
                borderColor: theme.border,
              }]}
              placeholder="Address Line 1 *"
              placeholderTextColor={theme.inputPlaceholder}
              value={address.line1}
              onChangeText={(t) => setAddress({ ...address, line1: t })}
            />
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBg,
                color: theme.inputText,
                borderColor: theme.border,
              }]}
              placeholder="Address Line 2"
              placeholderTextColor={theme.inputPlaceholder}
              value={address.line2}
              onChangeText={(t) => setAddress({ ...address, line2: t })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="City *"
                placeholderTextColor={theme.inputPlaceholder}
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="State"
                placeholderTextColor={theme.inputPlaceholder}
                value={address.state}
                onChangeText={(t) => setAddress({ ...address, state: t })}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="Pincode *"
                placeholderTextColor={theme.inputPlaceholder}
                value={address.pincode}
                onChangeText={(t) => setAddress({ ...address, pincode: t })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="Country"
                placeholderTextColor={theme.inputPlaceholder}
                value={address.country}
                onChangeText={(t) => setAddress({ ...address, country: t })}
              />
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Payment Method
            </Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBg,
                color: theme.inputText,
                borderColor: theme.border,
              }]}
              placeholder="Card Number *"
              placeholderTextColor={theme.inputPlaceholder}
              value={payment.cardNumber}
              onChangeText={(t) => setPayment({ ...payment, cardNumber: t })}
              keyboardType="numeric"
              maxLength={16}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="Expiry (MM/YY)"
                placeholderTextColor={theme.inputPlaceholder}
                value={payment.expiry}
                onChangeText={(t) => setPayment({ ...payment, expiry: t })}
              />
              <TextInput
                style={[styles.input, styles.halfInput, {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.border,
                }]}
                placeholder="CVV"
                placeholderTextColor={theme.inputPlaceholder}
                value={payment.cvv}
                onChangeText={(t) => setPayment({ ...payment, cvv: t })}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Order Summary
            </Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Delivery
              </Text>
              <Text style={styles.freeText}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, styles.total, { borderTopColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                Estimated Delivery
              </Text>
              <Text style={[styles.summaryValue, { color: theme.textSecondary }]}>
                5-7 Business Days
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, {
        backgroundColor: theme.card,
        borderTopColor: theme.border,
      }]}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { marginBottom: 4 },
  backBtnText: { fontSize: 15 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  content: { flex: 1, padding: 15 },
  section: { marginBottom: 15, borderRadius: 10, padding: 15, elevation: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  form: { gap: 10 },
  input: { padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 5, borderWidth: 1 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  summary: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16 },
  freeText: { fontSize: 16, color: "#388e3c", fontWeight: "bold" },
  total: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  footer: { padding: 15, borderTopWidth: 1 },
  placeOrderButton: { backgroundColor: "#ff3f6c", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#ffaab9" },
  placeOrderButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});