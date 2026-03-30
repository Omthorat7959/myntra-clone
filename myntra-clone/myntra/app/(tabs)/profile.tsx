import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User, Package, Heart, CreditCard, MapPin,
  Settings, LogOut, ChevronRight, Moon, Sun,
  Receipt,
} from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const menuItems = [
  { icon: Package, label: "My Orders", route: "/orders" },
  { icon: Receipt, label: "My Transactions", route: "/transactions" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Payment Methods", route: "/payments" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.replace("/(tabs)");
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.border,
        }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.avatarLarge}>
            <User size={50} color="#fff" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Please login to view your profile
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Sign in to access your orders, wishlist and more
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.signupButton, { borderColor: theme.primary }]}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={[styles.signupButtonText, { color: theme.primary }]}>
              CREATE ACCOUNT
            </Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user.name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.statItem, { borderRightColor: theme.border }]}
            onPress={() => router.push("/orders")}
          >
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              📦
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statItem, { borderRightColor: theme.border }]}
            onPress={() => router.push("/transactions")}
          >
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              💳
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/wishlist")}
          >
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              ❤️
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Wishlist
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.menuSection, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={toggleTheme}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, {
                backgroundColor: isDark ? "#2d1a1f" : "#fff4f4"
              }]}>
                {isDark
                  ? <Sun size={20} color={theme.primary} />
                  : <Moon size={20} color={theme.primary} />
                }
              </View>
              <View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {isDark ? "Light Mode" : "Dark Mode"}
                </Text>
                <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                  {isDark ? "Switch to light theme" : "Switch to dark theme"}
                </Text>
              </View>
            </View>
            <View style={[styles.toggleIndicator, {
              backgroundColor: isDark ? theme.primary : theme.surface,
              borderColor: theme.border,
            }]}>
              <Text style={{
                color: isDark ? "#fff" : theme.textMuted,
                fontSize: 11,
                fontWeight: "bold",
              }}>
                {isDark ? "ON" : "OFF"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: theme.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                { borderBottomColor: theme.border },
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: theme.primaryLight }]}>
                  <item.icon size={20} color={theme.primary} />
                </View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.appInfoText, { color: theme.textMuted }]}>
            Myntra Clone v1.0
          </Text>
          <Text style={[styles.appInfoText, { color: theme.textMuted }]}>
            Made with ❤️
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.primary }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={theme.primary} />
          <Text style={[styles.logoutText, { color: theme.primary }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  content: { flex: 1 },

  // Empty state
  emptyState: {
    flex: 1, justifyContent: "center",
    alignItems: "center", padding: 30, marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20, fontWeight: "bold",
    marginTop: 20, marginBottom: 8, textAlign: "center",
  },
  emptySubtitle: { fontSize: 14, marginBottom: 30, textAlign: "center" },
  loginButton: {
    backgroundColor: "#ff3f6c", paddingHorizontal: 50,
    paddingVertical: 14, borderRadius: 10, marginBottom: 12, width: "100%",
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  signupButton: {
    paddingHorizontal: 50, paddingVertical: 14,
    borderRadius: 10, borderWidth: 1.5, width: "100%",
  },
  signupButtonText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },

  // User card
  userCard: {
    flexDirection: "row", alignItems: "center",
    padding: 20, marginBottom: 15,
  },
  avatarLarge: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "#ff3f6c",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  userDetails: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  userEmail: { fontSize: 14 },

  // Quick Stats
  statsCard: {
    flexDirection: "row", marginHorizontal: 15,
    marginBottom: 15, borderRadius: 10, overflow: "hidden",
  },
  statItem: {
    flex: 1, alignItems: "center", padding: 15,
    borderRightWidth: 1,
  },
  statNumber: { fontSize: 24, marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: "500" },

  // Menu
  menuSection: {
    borderRadius: 10, marginHorizontal: 15,
    marginBottom: 15, overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    padding: 15, borderBottomWidth: 1,
  },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuIconBg: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    marginRight: 12,
  },
  menuItemLabel: { fontSize: 15, fontWeight: "500" },
  menuItemSub: { fontSize: 12, marginTop: 2 },
  toggleIndicator: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1,
  },

  // App info
  appInfo: {
    marginHorizontal: 15, marginBottom: 15,
    padding: 15, borderRadius: 10, alignItems: "center",
  },
  appInfoText: { fontSize: 13, marginBottom: 4 },

  // Logout
  logoutButton: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", padding: 15,
    marginHorizontal: 15, borderRadius: 10, borderWidth: 1.5,
  },
  logoutText: { marginLeft: 10, fontSize: 16, fontWeight: "bold" },
});