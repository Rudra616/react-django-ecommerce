// components/apis.js
const API_BASE = import.meta.env.VITE_API_BASE;
import axios from 'axios';
const api = axios.create({
  baseURL: API_BASE,
});
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE}token/refresh/`, {
          refresh: refreshToken
        });

        if (response.data.access) {
          localStorage.setItem('accessToken', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// -------------------- TOKEN MANAGEMENT --------------------

/**
 * Check if a JWT token is still valid
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if token is valid, false otherwise
 */
// apis.js - updated with jwt-decode
import jwt_decode from 'jwt-decode';

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Get a valid access token, refreshing if necessary
 * @returns {Promise<string|null>} - Valid access token or null if not available
 */
export const getValidToken = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // Return valid access token if available
  if (accessToken && isTokenValid(accessToken)) {
    return accessToken;
  }
  
  // Try to refresh access token if refresh token is available
  if (refreshToken && isTokenValid(refreshToken)) {
    try {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        return newAccessToken;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }
  
  // Clear tokens if both are invalid
  clearTokens();
  return null;
};

/**
 * Clear all authentication tokens from storage
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// -------------------- REFRESH TOKEN --------------------

/**
 * Refresh access token using refresh token
 * @returns {Promise<string|null>} - New access token or null if refresh failed
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.error("No refresh token available");
    clearTokens();
    return null;
  }

  // Check if refresh token is still valid
  if (!isTokenValid(refreshToken)) {
    console.error("Refresh token is expired");
    clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.status === 401) {
      console.error("Refresh token is invalid or expired");
      clearTokens();
      return null;
    }

    if (!res.ok) {
      console.error("Failed to refresh token - server error");
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("accessToken", data.access);
      return data.access;
    }
    
    console.error("No access token in refresh response");
    return null;
  } catch (error) {
    console.error("Network error during token refresh:", error);
    return null;
  }
};
// -------------------- AUTHENTICATED FETCH --------------------

/**
 * Wrapper for fetch that automatically handles authentication
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const authFetch = async (url, options = {}) => {
  const accessToken = await getValidToken();
  
  if (!accessToken) {
    throw new Error("Authentication required. Please login.");
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, { ...options, headers });
    
  // If unauthorized, clear tokens and throw error
  if (response.status === 401) {
    clearTokens();
    throw new Error("Session expired. Please login again.");
  }

  return response;
};

// -------------------- LOGIN --------------------

/**
 * Authenticate user with credentials
 * @param {Object} credentials - Login credentials {username, password}
 * @returns {Promise<Object>} - Login result with success status and data
 */

export const loginUser = async (credentials) => {
  try {
    const res = await fetch(`${API_BASE}login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (res.ok && data.access && data.refresh) {
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      return { success: true, data };
    } else {
      return { success: false, error: data?.detail || "Invalid email or password" };
    }
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};
// -------------------- PUBLIC API FUNCTIONS --------------------

/**
 * Fetch all categories
 * @returns {Promise<Object>} - Categories data with success status
 */
export const getCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}categories/`);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return { success: true, categories: data.results };   
    } else {
      return { success: false, categories: [] };
    }
  } catch (err) {
    return { success: false, categories: [] };
  }
};

/**
 * Fetch products by category ID
 * @param {number} categoryId - ID of the category
 * @returns {Promise<Object>} - Products data with success status
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    const res = await fetch(`${API_BASE}categories/${categoryId}/products/`);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return { success: true, products: data.results };
    } else {
      return { success: false, products: [] };
    }
  } catch (err) {
    console.error("Failed to fetch products by category", err);
    return { success: false, products: [] };
  }
};

/**
 * Fetch products with optional search query
 * @param {string} query - Search query string
 * @returns {Promise<Object>} - Products data with success status
 */
export const getproducts = async (query = "") => {
  try {
    const url = query
      ? `${API_BASE}products/?search=${encodeURIComponent(query)}`
      : `${API_BASE}products/`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return { success: true, products: data.results };
    } else {
      return { success: false, products: [] };
    }
  } catch (error) {
    console.error(error);
    return { success: false, products: [] };
  }
};

// -------------------- PROTECTED API FUNCTIONS --------------------

/**
 * Fetch detailed information about a specific product
 * @param {number} productId - ID of the product
 * @returns {Promise<Object>} - Product details with success status
 */
export const getProductDetail = async (productId) => {
  try {
    const res = await authFetch(`${API_BASE}products/${productId}/`);

    if (!res.ok) {
      const errorData = await res.json();
      return { 
        success: false, 
        productdetial: null, 
        error: errorData.detail || "Error fetching product" 
      };
    }

    const data = await res.json();
    return { success: true, productdetial: data };

  } catch (error) {
    console.error("Error fetching product detail:", error);
    return { 
      success: false, 
      productdetial: null, 
      error: error.message || "Network error" 
    };
  }
};

/**
 * Fetch user's cart items
 * @returns {Promise<Object>} - Cart items with success status
 */
export const getCart = async () => {
  try {
    const res = await authFetch(`${API_BASE}cart/`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Cart API response:", data); // Debug the response
    
    const cartItems = data.results || data;
    
    // Ensure each item has the proper structure
    const formattedItems = Array.isArray(cartItems) ? cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product || item.product_id // Handle both structures
    })) : [];
    
    return { success: true, items: formattedItems };
  } catch (err) {
    console.error("Error fetching cart:", err);
    
    if (err.message.includes("Authentication") || err.message.includes("login")) {
      return { success: false, items: [], error: "Please login to view cart" };
    }
    
    return { success: false, items: [], error: err.message };
  }
};
/**
 * Add product to user's cart
 * @param {number} productId - ID of the product to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<Object>} - Operation result with success status
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await authFetch(`${API_BASE}cart/`, {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Logout user by clearing tokens
 */
export const logoutUser = async () => {
  clearTokens();
};


// Add these functions to your apis.js file

/**
 * Update quantity of a cart item
 * @param {number} itemId - ID of the cart item
 * @param {number} quantity - New quantity (1-5)
 * @returns {Promise<Object>} - Operation result
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const res = await authFetch(`${API_BASE}cart/${itemId}/`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Remove item from cart
 * @param {number} itemId - ID of the cart item to remove
 * @returns {Promise<Object>} - Operation result
 */
export const removeCartItem = async (itemId) => {
  try {
    const res = await authFetch(`${API_BASE}cart/${itemId}/`, {
      method: "DELETE",
    });
    
    return { success: res.ok };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Forget password
 * @param {email} - email throw send mail 
 * @returns {Promise<Object>} - Operation result
 */
export const  forgetpassword = async (email) =>{
  try{
    const res = await fetch(`${API_BASE}password/forgot/`, {
      method:'POST',
      headers: {"Content-Type":"application/json"},
      body:JSON.stringify({email}),
    });
    const data = await res.json();
    if(res.status === 200){
      return { success:true,message:data.message };
    }
    else{
      return { success:false,error:data.error || "faied to send reset link" }
    }
  }catch(err){
    return { success: false, error: "Network error. Please try again." };
  }
}



// components/apis.js - Add this function
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Registration result with success status and data
 */
export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    
    if (res.status === 201) {
      return { 
        success: true, 
        message: data.message || "User registered successfully. Please verify your email." 
      };
    } else {
      // Extract field-specific errors or general errors
      const errorMessages = [];
      for (const [field, errors] of Object.entries(data)) {
        if (Array.isArray(errors)) {
          errorMessages.push(...errors.map(error => `${field}: ${error}`));
        } else if (typeof errors === 'string') {
          errorMessages.push(errors);
        }
      }
      
      return { 
        success: false, 
        errors: errorMessages.length > 0 ? errorMessages : ["Registration failed. Please try again."],
        fieldErrors: data
      };
    }
  } catch (err) {
    return { 
      success: false, 
      errors: ["Network error. Please check your connection and try again."] 
    };
  }
};



// components/apis.js - Add this function
/**
 * Verify email address with token
 * @param {string} uidb64 - Base64 encoded user ID
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Verification result
 */
// apis.js - Fix verifyEmail function
export const verifyEmail = async (uidb64, token) => {
  try {
    console.log("Making verification request to:", `${API_BASE}verify-email/${uidb64}/${token}/`);
    
    const res = await fetch(`${API_BASE}verify-email/${uidb64}/${token}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Verification response status:", res.status);
    
    const data = await res.json();
    console.log("Verification response data:", data);

    if (res.ok) {
      return { 
        success: true, 
        message: data.message || "Email verified successfully!" 
      };
    } else {
      return { 
        success: false, 
        error: data.error || data.detail || "Email verification failed. Please try again." 
      };
    }
  } catch (err) {
    console.error("Verification error:", err);
    return { 
      success: false, 
      error: "Network error. Please check your connection and try again." 
    };
  }
};



// components/apis.js - Add these functions

/**
 * Get reviews for a product
 * @param {number} productId - ID of the product
 * @returns {Promise<Object>} - Reviews data with success status
 */
// apis.js - Update getProductReviews function
export const getProductReviews = async (productId) => {
  try {
    // Try to use authFetch first (for authenticated users)
    let res;
    try {
      res = await authFetch(`${API_BASE}products/${productId}/reviews/`);
    } catch (authError) {
      // If auth fails (401), try without authentication
      if (authError.message.includes("Authentication") || authError.message.includes("401")) {
        res = await fetch(`${API_BASE}products/${productId}/reviews/`);
      } else {
        throw authError;
      }
    }

    const data = await res.json();

    if (res.ok) {
      const reviews = data.results || data;
      return { 
        success: true, 
        reviews: Array.isArray(reviews) ? reviews : [],
        count: data.count || reviews.length,
        averageRating: calculateAverageRating(reviews)
      };
    } else {
      return { 
        success: false, 
        reviews: [], 
        error: data.detail || "Failed to fetch reviews" 
      };
    }
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { 
      success: false, 
      reviews: [], 
      error: error.message || "Network error" 
    };
  }
};/**
 * Create a new review for a product
 * @param {number} productId - ID of the product
 * @param {Object} reviewData - Review data {rating, comment, title}
 * @returns {Promise<Object>} - Operation result
 */
// apis.js - Enhanced createProductReview function
// apis.js - Update createProductReview function
export const createProductReview = async (productId, reviewData) => {
  try {
    const res = await authFetch(`${API_BASE}products/${productId}/reviews/`, {
      method: "POST",
      body: JSON.stringify({
        rating: reviewData.rating,
        title: reviewData.title || "",
        comment: reviewData.comment || ""
      }),
    });

    const data = await res.json();

    if (res.status === 201) {
      return { 
        success: true, 
        review: data,
        message: "Review submitted successfully!" 
      };
    } else if (res.status === 400 && data.existing_review) {
      // Handle "already reviewed" with existing review data
      return { 
        success: false, 
        error: data.detail || "You have already reviewed this product.",
        alreadyReviewed: true,
        existingReview: data.existing_review
      };
    } else if (res.status === 400 && data.error) {
      // Handle other validation errors
      return { 
        success: false, 
        error: data.error,
        alreadyReviewed: false
      };
    } else {
      // Handle field-specific errors
      const errorMessages = [];
      for (const [field, errors] of Object.entries(data)) {
        if (Array.isArray(errors)) {
          errorMessages.push(...errors.map(error => `${field}: ${error}`));
        } else if (typeof errors === 'string') {
          errorMessages.push(errors);
        }
      }
      
      return { 
        success: false, 
        error: errorMessages.length > 0 ? errorMessages : "Failed to submit review",
        fieldErrors: data
      };
    }
  } catch (error) {
    console.error("Error creating review:", error);
    return { 
      success: false, 
      error: "Network error. Please try again." 
    };
  }
};
// Enhanced getUserProductReview function

/**
 * Update an existing review
 * @param {number} reviewId - ID of the review
 * @param {Object} reviewData - Updated review data {rating, comment, title}
 * @returns {Promise<Object>} - Operation result
 */
export const updateProductReview = async (reviewId, reviewData) => {
  try {
    const res = await authFetch(`${API_BASE}reviews/${reviewId}/`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();

    if (res.ok) {
      return { 
        success: true, 
        review: data,
        message: "Review updated successfully!" 
      };
    } else {
      return { 
        success: false, 
        error: data.detail || "Failed to update review" 
      };
    }
  } catch (error) {
    console.error("Error updating review:", error);
    return { 
      success: false, 
      error: "Network error. Please try again." 
    };
  }
};

/**
 * Delete a review
 * @param {number} reviewId - ID of the review to delete
 * @returns {Promise<Object>} - Operation result
 */
export const deleteProductReview = async (reviewId) => {
  try {
    const res = await authFetch(`${API_BASE}reviews/${reviewId}/`, {
      method: "DELETE",
    });

    if (res.status === 204) {
      return { 
        success: true, 
        message: "Review deleted successfully!" 
      };
    } else {
      const data = await res.json();
      return { 
        success: false, 
        error: data.detail || "Failed to delete review" 
      };
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    return { 
      success: false, 
      error: "Network error. Please try again." 
    };
  }
};

/**
 * Get user's review for a specific product
 * @param {number} productId - ID of the product
 * @returns {Promise<Object>} - User's review data
 */
// apis.js - Update getUserProductReview
export const getUserProductReview = async (productId) => {
  try {
    const res = await authFetch(`${API_BASE}products/${productId}/reviews/`);
    const data = await res.json();

    if (res.ok) {
      const reviews = data.results || data;
      // Look for the current user's review using the is_current_user_review flag
      // or by checking if the review belongs to the current user
      const userReview = Array.isArray(reviews) 
        ? reviews.find(review => review.is_current_user_review) 
        : null;
      
      return { 
        success: true, 
        review: userReview || null 
      };
    } else {
      return { 
        success: false, 
        review: null, 
        error: data.detail || "Failed to fetch user review" 
      };
    }
  } catch (error) {
    console.error("Error fetching user review:", error);
    // If auth fails, try without authentication (though this shouldn't find user-specific reviews)
    try {
      const res = await fetch(`${API_BASE}products/${productId}/reviews/`);
      const data = await res.json();
      
      if (res.ok) {
        return { 
          success: true, 
          review: null // Can't identify user review without auth
        };
      } else {
        return { 
          success: false, 
          review: null, 
          error: data.detail || "Failed to fetch reviews" 
        };
      }
    } catch (fallbackError) {
      return { 
        success: false, 
        review: null, 
        error: "Network error. Please try again." 
      };
    }
  }
};
// Helper function to calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return (total / reviews.length).toFixed(1);
};



// apis.js - Add these functions

/**
 * Get user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  try {
    const res = await authFetch(`${API_BASE}user/`);
    
    // Check if response is OK first
    if (!res.ok) {
      const errorData = await res.json();
      return { 
        success: false, 
        error: errorData.detail || "Failed to fetch user profile" 
      };
    }

    const data = await res.json();
    
    // Handle both response formats for backward compatibility
    if (data.user) {
      return { 
        success: true, 
        user: data.user,
        message: data.message 
      };
    } else {
      // If no user field, assume the entire response is user data
      return { 
        success: true, 
        user: data,
        message: "Profile retrieved successfully" 
      };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { 
      success: false, 
      error: "Network error. Please try again." 
    };
  }
};
/**
 * Update user profile
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Operation result
 */
export const updateUserProfile = async (userData) => {
  try {
    const res = await authFetch(`${API_BASE}user/`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      return { 
        success: true, 
        data,
        message: data.message || "Profile updated successfully!" 
      };
    } else {
      // Handle validation errors
      const errorMessages = [];
      for (const [field, errors] of Object.entries(data)) {
        if (Array.isArray(errors)) {
          errorMessages.push(...errors.map(error => `${field}: ${error}`));
        } else if (typeof errors === 'string') {
          errorMessages.push(errors);
        }
      }
      
      return { 
        success: false, 
        errors: errorMessages.length > 0 ? errorMessages : ["Failed to update profile"],
        fieldErrors: data
      };
    }
  } catch (error) {
    return { 
      success: false, 
      errors: ["Network error. Please try again."] 
    };
  }
};

/**
 * Verify email change
 * @param {string} uidb64 - Base64 encoded user ID
 * @param {string} token - Verification token
 * @param {string} newEmailB64 - Base64 encoded new email
 * @returns {Promise<Object>} - Verification result
 */
export const verifyEmailChange = async (uidb64, token, newEmailB64) => {
  try {
    const res = await fetch(`${API_BASE}verify-email-change/${uidb64}/${token}/${newEmailB64}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || "Email updated successfully!" };
    } else {
      const errorData = await res.json();
      return { 
        success: false, 
        error: errorData.error || "Email verification failed. Please try again." 
      };
    }
  } catch (err) {
    return { 
      success: false, 
      error: "Network error. Please check your connection and try again." 
    };
  }
};

// apis.js - Add these functions
/**
 * Change user password
 * @param {Object} passwordData - {current_password, new_password, confirm_password}
 * @returns {Promise<Object>} - Operation result
 */
// apis.js - Update changePassword function
export const changePassword = async (passwordData) => {
  try {
    const res = await authFetch(`${API_BASE}user/change-password/`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();

      if (res.ok) {
        return { 
          success: true, 
          message: data.message || "Password changed successfully!" 
        };
      } else {
        // Handle field-specific errors
        const errorMessages = [];
        for (const [field, errors] of Object.entries(data)) {
          if (Array.isArray(errors)) {
            errorMessages.push(...errors.map(error => `${field}: ${error}`));
          } else if (typeof errors === 'string') {
            errorMessages.push(errors);
          }
        }
        
        return { 
          success: false, 
          error: errorMessages.length > 0 ? errorMessages : "Failed to change password",
          fieldErrors: data
        };
      }
    } else {
      // Handle non-JSON response (HTML error page)
      const text = await res.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      
      if (res.status === 404) {
        return { 
          success: false, 
          error: "Password change endpoint not found. Please check the API URL." 
        };
      } else if (res.status === 500) {
        return { 
          success: false, 
          error: "Server error. Please try again later." 
        };
      } else {
        return { 
          success: false, 
          error: `Unexpected response (${res.status}): ${text.substring(0, 100)}...` 
        };
      }
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return { 
      success: false, 
      error: "Network error. Please try again." 
    };
  }
};


// Add this debug function to help troubleshoot
export const debugPasswordEndpoint = async () => {
  try {
    console.log("Testing password endpoint:", `${API_BASE}user/change-password/`);
    
    const res = await fetch(`${API_BASE}user/change-password/`, {
      method: "OPTIONS", // Use OPTIONS to check if endpoint exists
    });
    
    console.log("Endpoint status:", res.status);
    console.log("Endpoint headers:", Object.fromEntries([...res.headers]));
    
    return res.status;
  } catch (error) {
    console.error("Debug error:", error);
    return null;
  }
};



// Add this to apis.js
export const resetPassword = async (uidb64, token, newPassword) => {
  try {
    const res = await fetch(`${API_BASE}password/reset/${uidb64}/${token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      return { success: true, message: data.message || "Password reset successfully!" };
    } else {
      return { success: false, error: data.error || "Failed to reset password" };
    }
  } catch (err) {
    return { success: false, error: "Network error. Please try again." };
  }
};



// Add these functions to your apis.js file

/**
 * Fetch user's orders
 * @returns {Promise<Object>} - Orders data with success status
 */
// Update your getOrders function to debug the actual response
// In apis.js - Update getOrders function
export const getOrders = async () => {
  try {
    console.log("Fetching orders from:", `${API_BASE}orders/`);
    const res = await authFetch(`${API_BASE}orders/`);
    
    console.log("Orders response status:", res.status);
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Orders API response:", data);
    
    // Handle both response formats
    let orders = [];
    if (data.orders && Array.isArray(data.orders)) {
      orders = data.orders;
    } else if (data.results && Array.isArray(data.results)) {
      orders = data.results;
    } else if (Array.isArray(data)) {
      orders = data;
    }
    
    // Filter out invalid orders
    const validOrders = orders.filter(order => 
      order && order.id && (order.items === undefined || Array.isArray(order.items))
    );
    
    console.log("Valid orders found:", validOrders.length);
    
    return { 
      success: true, 
      orders: validOrders,
      count: validOrders.length
    };
  } catch (err) {
    console.error("Error fetching orders:", err);
    
    if (err.message.includes("Authentication") || err.message.includes("401")) {
      return { success: false, orders: [], error: "Please login to view orders" };
    }
    
    return { success: false, orders: [], error: err.message };
  }
};
/**
 * Get order details by ID
 * @param {number} orderId - ID of the order
 * @returns {Promise<Object>} - Order details with success status
 */
export const getOrderDetail = async (orderId) => {
  try {
    const res = await authFetch(`${API_BASE}orders/${orderId}/`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, order: data };
  } catch (err) {
    console.error("Error fetching order details:", err);
    return { success: false, order: null, error: err.message };
  }
};

/**
 * Create a new order from cart items
 * @param {Array} items - Cart items to convert to order
 * @returns {Promise<Object>} - Operation result
 */
// Update the createOrder function in apis.js
// Update createOrder function in apis.js

// Update createOrder function in apis.js
// Update createOrder function in apis.js
export const createOrder = async (items) => {
  try {
    console.log("Creating order with items:", items);
    
    // Debug: Check the product structure in each item
    items.forEach((item, index) => {
      console.log(`Item ${index} product structure:`, {
        has_product: !!item.product,
        product_type: typeof item.product,
        product_id: item.product?.id,
        product_object: item.product
      });
    });

    // Create the order data with proper product IDs
    const orderData = {
      items: items.map(item => {
        // Extract the product ID from the product object
        const productId = item.product?.id;
        
        if (!productId) {
          console.error("No product ID found in item:", item);
          throw new Error("Product ID is missing in cart item");
        }
        
        return {
          product: productId,  // Send just the ID, not the object
          quantity: item.quantity
        };
      })
    };
    
    console.log("Order data being sent:", JSON.stringify(orderData, null, 2));
    
    // Get the access token
    const accessToken = await getValidToken();
    if (!accessToken) {
      throw new Error("Authentication required. Please login.");
    }
    
    // Make the request with proper headers
    const res = await fetch(`${API_BASE}orders/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData),
    });
    
    console.log("Order creation response status:", res.status);
    
    const responseText = await res.text();
    console.log("Raw response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      data = { detail: responseText };
    }
    
    if (!res.ok) {
      console.error("Order creation failed:", data);
      return { 
        success: false, 
        data, 
        status: res.status,
        error: data.detail || data.error || "Failed to create order" 
      };
    }
    
    return { success: true, data, status: res.status };
  } catch (err) {
    console.error("Order creation error:", err);
    return { 
      success: false, 
      error: err.message,
      status: err.response?.status 
    };
  }
};
/**
 * Get payment details for an order
 * @param {number} orderId - ID of the order
 * @returns {Promise<Object>} - Payment data
 */

export const getPaymentDetails = async (orderId) => {
  try {
    const res = await authFetch(`${API_BASE}payments/list/?order=${orderId}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const payments = data.results || data;
    return { 
      success: true, 
      payment: Array.isArray(payments) && payments.length > 0 ? payments[0] : null 
    };
  } catch (err) {
    console.error("Error fetching payment:", err);
    return { success: false, payment: null, error: err.message };
  }
};


/**
 * Create payment for an order
 * @param {number} orderId - ID of the order
 * @param {string} paymentMethod - Payment method (e.g., 'card', 'upi', 'cod')
 * @returns {Promise<Object>} - Operation result
 */
export const createPayment = async (orderId, paymentMethod = 'cod') => {
  try {
    const res = await authFetch(`${API_BASE}payments/`, {
      method: "POST",
      body: JSON.stringify({
        order: orderId,
        payment_method: paymentMethod
      }),
    });
    
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


/**
 * Update order status
 * @param {number} orderId - ID of the order
 * @param {string} status - New status
 * @returns {Promise<Object>} - Operation result
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await authFetch(`${API_BASE}orders/${orderId}/status/`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    
    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};



// Test with a simple request first
export const testOrderEndpoint = async () => {
  try {
    const res = await authFetch(`${API_BASE}orders/`, {
      method: "GET"
    });
    console.log("GET orders response:", res.status, await res.json());
    return { success: res.ok };
  } catch (err) {
    console.error("GET orders error:", err);
    return { success: false, error: err.message };
  }
};


// Add this debug function
export const debugCartStructure = async () => {
  try {
    const res = await authFetch(`${API_BASE}cart/`);
    const data = await res.json();
    console.log("Cart structure debug:", data);
    
    // Check the first item structure
    const firstItem = data.results?.[0] || data?.[0];
    if (firstItem) {
      console.log("First cart item structure:", {
        id: firstItem.id,
        quantity: firstItem.quantity,
        product: firstItem.product,
        product_id: firstItem.product_id,
        has_product_object: !!firstItem.product,
        has_product_id: !!firstItem.product_id,
        product_type: typeof firstItem.product
      });
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Debug error:", err);
    return { success: false, error: err.message };
  }
};

// Call this in your Cart component to debug
// debugCartStructure();



// Add this debug function to check what's actually being sent
const debugRequest = async (url, options) => {
  console.log("Request URL:", url);
  console.log("Request method:", options.method);
  console.log("Request headers:", options.headers);
  console.log("Request body:", options.body);
  
  try {
    const response = await fetch(url, options);
    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
    return response;
  } catch (error) {
    console.error("Request error:", error);
    throw error;
  }
};

// // Replace the authFetch call with this for debugging:
// const res = await debugRequest(`${API_BASE}orders/`, {
//   method: "POST",
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${await getValidToken()}`
//   },
//   body: JSON.stringify(orderData),
// });

// Add this debug function
export const debugOrderCreation = async () => {
  try {
    // Test with a simple known product ID
    const testData = {
      items: [
        {
          product: 15,  // Use a product ID that exists in your database
          quantity: 1
        }
      ]
    };
    
    console.log("Testing order creation with:", testData);
    
    const res = await authFetch(`${API_BASE}orders/`, {
      method: "POST",
      body: JSON.stringify(testData),
    });
    
    const responseText = await res.text();
    console.log("Test response status:", res.status);
    console.log("Test response text:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }
    
    return { success: res.ok, data, status: res.status };
  } catch (err) {
    console.error("Debug test error:", err);
    return { success: false, error: err.message };
  }
};

// Call this function to test if the endpoint works
// debugOrderCreation();