// src/api/authApi.jsx
import axiosInstance from "./axiosConfig";

// Register
export const registerUser = async (userData) => {
  const response = await axiosInstance.post("register/", userData);
  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  const response = await axiosInstance.post("login/", credentials);
  return response.data;
};

// Get user details
export const getUserDetails = async () => {
  const response = await axiosInstance.get("user/");
  return response.data;
};

// Logout
export const logoutUser = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token found");

  try {
    await axiosInstance.post("/logout/", { refresh }); // ✅ key must be exactly "refresh"
  } catch (err) {
    console.error("Logout failed:", err.response?.data || err.message);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  }
};


// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("password/forgot/", { email });
    return response;
  } catch (error) {
    throw error;
  }
};


// Reset password
export const resetPassword = async (uid, token, newPassword) => {
  const response = await axiosInstance.post(
    `password/reset/${uid}/${token}/`,
    { password: newPassword }
  );
  return response.data;
};

// Verify email
export const verifyEmail = async (uid, token) => {
  const response = await axiosInstance.get(`verify-email/${uid}/${token}/`);
  return response.data;
};
