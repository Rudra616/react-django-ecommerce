// src/api/axiosConfig.js
import axios from "axios";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// List of public endpoints that don't need auth or token refresh
const PUBLIC_ENDPOINTS = [
  "login/",
  "register/",
  "password/forgot/",
  "password/reset/",
  "verify-email/",
  "auth/jwt/refresh/", // Add refresh endpoint to public
  "token/refresh/"
];

// Store the current refresh token attempt to prevent multiple simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // Only add token for non-public endpoints
  if (token && !PUBLIC_ENDPOINTS.some((ep) => config.url.includes(ep))) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry for public endpoints or if already retried
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
      originalRequest.url.includes(endpoint)
    );

    if (error.response?.status === 401 && !isPublic && !originalRequest._retry) {

      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}token/refresh/`,
          { refresh: refreshToken }
        );


        const newAccessToken = response.data.access;

        // Store new tokens
        localStorage.setItem("accessToken", newAccessToken);

        // Update the failed request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Process any queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Clear all tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");

        // Process queued requests with error
        processQueue(refreshError, null);

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;