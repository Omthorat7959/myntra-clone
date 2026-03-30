import { createContext, useContext, useEffect, useState } from "react";
import { getUserData, saveUserData, clearUserData } from "@/utils/storage";
import React from "react";
import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = Platform.OS === "web"
  ? "http://localhost:5000"
  : "http://172.20.10.3:5000";

type AuthContextType = {
  isAuthenticated: boolean;
  user: { _id: string; name: string; email: string } | null;
  Signup: (fullName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserData();
        if (data._id && data.name && data.email) {
          setUser({ _id: data._id, name: data.name, email: data.email });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log("Error loading user data:", error);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password,
      });
      const data = res.data.user;
      if (data.fullName) {
        await saveUserData(data._id, data.fullName, data.email);
        setUser({ _id: data._id, name: data.fullName, email: data.email });
        setIsAuthenticated(true);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const Signup = async (fullName: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/signup`, {
        fullName,
        email,
        password,
      });
      const data = res.data.user;
      if (data.fullName) {
        await saveUserData(data._id, data.fullName, data.email);
        setUser({ _id: data._id, name: data.fullName, email: data.email });
        setIsAuthenticated(true);
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  const logout = async () => {
    try {
      await clearUserData();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, Signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;