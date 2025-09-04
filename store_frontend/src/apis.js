const API_BASE = import.meta.env.VITE_API_BASE;

// -------------------- LOGIN --------------------
export const loginUser = async (credentials) => {
  try {
    const res = await fetch(`${API_BASE}login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    return res.ok ? { success: true, data } : { success: false, data };
  } catch (err) {
    return { success: false, data: { non_field_errors: [err.message || "Network error"] } };
  }
};

// -------------------- REGISTER --------------------
export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    return res.ok ? { success: true, data } : { success: false, data };
  } catch (err) {
    return { success: false, data: { non_field_errors: [err.message || "Network error"] } };
  }
};

// -------------------- CATEGORIES --------------------
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

// ✅ FIXED — Get products in a specific category
// Get products in a specific category
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


// -------------------- PRODUCTS --------------------
export const getProducts = async () => {
  try {
    const res = await fetch(`${API_BASE}products/`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getProductDetail = async (productId) => {
  try {
    const res = await fetch(`${API_BASE}products/${productId}/`);
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// -------------------- CART --------------------
export const getCart = async (token) => {
  try {
    const res = await fetch(`${API_BASE}cart/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add to cart
export const addToCart = async (item, token) => {
  try {
    const res = await fetch(`${API_BASE}cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// -------------------- ORDERS --------------------
export const getOrders = async (token) => {
  try {
    const res = await fetch(`${API_BASE}orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// -------------------- PAYMENTS --------------------
export const createPayment = async (paymentData, token) => {
  try {
    const res = await fetch(`${API_BASE}payments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// -------------------- REVIEWS --------------------
export const getProductReviews = async (productId) => {
  try {
    const res = await fetch(`${API_BASE}products/${productId}/reviews/`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const createReview = async (productId, reviewData, token) => {
  try {
    const res = await fetch(`${API_BASE}products/${productId}/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
