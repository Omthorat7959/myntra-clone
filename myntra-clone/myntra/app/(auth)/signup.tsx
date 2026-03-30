import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView, ActivityIndicator, Alert, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function SignupScreen() {
  const { Signup } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isloading, setisloading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", email: "", password: "" };
    if (!formData.fullName.trim()) { newErrors.fullName = "Full name is required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Please enter a valid email"; isValid = false; }
    if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }
    else if (formData.password.length < 8) { newErrors.password = "Password must be at least 8 characters"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    try {
      setisloading(true);
      await Signup(formData.fullName, formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setisloading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Banner Image */}
      <Image
        source={{ uri: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Form */}
      <View style={[styles.formContainer, {
        backgroundColor: theme.card,
        ...Platform.select({
          web: { boxShadow: "0px -4px 10px rgba(0,0,0,0.2)" },
          default: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
            elevation: 10,
          },
        }),
      }]}>
        {/* Logo */}
        <Text style={[styles.logo, { color: theme.primary }]}>MYNTRA</Text>
        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join Myntra and discover amazing fashion
        </Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBg,
              color: theme.inputText,
              borderColor: errors.fullName ? "#ff3f6c" : theme.border,
            }]}
            placeholder="Enter your full name"
            placeholderTextColor={theme.inputPlaceholder}
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData({ ...formData, fullName: text });
              setErrors({ ...errors, fullName: "" });
            }}
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBg,
              color: theme.inputText,
              borderColor: errors.email ? "#ff3f6c" : theme.border,
            }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.inputPlaceholder}
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              setErrors({ ...errors, email: "" });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
          <View style={[styles.passwordContainer, {
            backgroundColor: theme.inputBg,
            borderColor: errors.password ? "#ff3f6c" : theme.border,
          }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.inputText }]}
              placeholder="Min 8 characters"
              placeholderTextColor={theme.inputPlaceholder}
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                setErrors({ ...errors, password: "" });
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword
                ? <EyeOff size={20} color={theme.textSecondary} />
                : <Eye size={20} color={theme.textSecondary} />
              }
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.button, isloading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isloading}
        >
          {isloading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {/* Login Link */}
        <TouchableOpacity
          style={[styles.loginButton, { borderColor: theme.primary }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={[styles.loginButtonText, { color: theme.primary }]}>
            ALREADY HAVE AN ACCOUNT
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  backgroundImage: {
    width: "100%",
    height: Platform.OS === "web" ? 250 : 300,
  },
  formContainer: {
    flex: 1, padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  logo: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8, letterSpacing: 4 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 25 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1 },
  errorText: { color: "#ff3f6c", fontSize: 12, marginTop: 5, marginLeft: 5 },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1 },
  passwordInput: { flex: 1, padding: 15, fontSize: 16 },
  eyeIcon: { padding: 15 },
  button: { backgroundColor: "#ff3f6c", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonDisabled: { backgroundColor: "#ffaab9" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 13 },
  loginButton: { padding: 15, borderRadius: 10, alignItems: "center", borderWidth: 1.5 },
  loginButtonText: { fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
});