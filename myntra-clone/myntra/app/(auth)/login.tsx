import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert, ScrollView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setisloading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    if (!email.trim()) { setEmailError("Email is required"); isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Please enter a valid email"); isValid = false; }
    if (!password) { setPasswordError("Password is required"); isValid = false; }
    else if (password.length < 6) { setPasswordError("Password must be at least 6 characters"); isValid = false; }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      setisloading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
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
        source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Dark overlay on image for dark mode */}
      {/* Form */}
      <View style={[styles.formContainer, {
        backgroundColor: theme.card,
        ...Platform.select({
          web: { boxShadow: "0px -4px 10px rgba(0,0,0,0.2)" },
          default: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 10,
          },
        }),
      }]}>
        {/* Logo */}
        <Text style={[styles.logo, { color: theme.primary }]}>MYNTRA</Text>
        <Text style={[styles.title, { color: theme.text }]}>Welcome Back!</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Login to continue shopping
        </Text>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBg,
              color: theme.inputText,
              borderColor: emailError ? "#ff3f6c" : theme.border,
            }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.inputPlaceholder}
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(""); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
          <View style={[styles.passwordContainer, {
            backgroundColor: theme.inputBg,
            borderColor: passwordError ? "#ff3f6c" : theme.border,
          }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.inputText }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.inputPlaceholder}
              value={password}
              onChangeText={(text) => { setPassword(text); setPasswordError(""); }}
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
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, isloading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isloading}
        >
          {isloading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>LOGIN</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {/* Signup Link */}
        <TouchableOpacity
          style={[styles.signupButton, { borderColor: theme.primary }]}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={[styles.signupButtonText, { color: theme.primary }]}>
            CREATE NEW ACCOUNT
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
    flex: 1,
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  logo: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8, letterSpacing: 4 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 25 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    padding: 15, borderRadius: 10, fontSize: 16,
    borderWidth: 1,
  },
  inputError: { borderColor: "#ff3f6c" },
  errorText: { color: "#ff3f6c", fontSize: 12, marginTop: 5, marginLeft: 5 },
  passwordContainer: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 10, borderWidth: 1,
  },
  passwordInput: { flex: 1, padding: 15, fontSize: 16 },
  eyeIcon: { padding: 15 },
  button: {
    backgroundColor: "#ff3f6c", padding: 15,
    borderRadius: 10, alignItems: "center", marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#ffaab9" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 13 },
  signupButton: {
    padding: 15, borderRadius: 10, alignItems: "center",
    borderWidth: 1.5,
  },
  signupButtonText: { fontSize: 15, fontWeight: "bold", letterSpacing: 1 },
});