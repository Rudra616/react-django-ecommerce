// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'; // ✅ Add useEffect import
import {
  loginUser,
  registerUser,
  getUserDetails,
  logoutUser,
} from "../api/authApi";

// Create Context
export const AuthContext = createContext();

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount if accessToken exists
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await getUserDetails();
          setUser(response.user || response); // set user
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Fetch profile
      const userData = await getUserDetails();
      setUser(userData.user || userData);
      setError(null);
      return userData;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const data = await registerUser(userData);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
