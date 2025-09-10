// App.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SearchResults from "./components/SearchResults";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import About from "./components/About";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Register from "./components/Register";
import EmailVerification from "./components/EmailVerification";
import Profile from "./components/Profile";
import OrdersPage from "./components/OrdersPage";
import OrderDetailPage from "./components/OrderDetailPage";
import OrderConfirmation from "./components/OrderConfirmation";
import {
  getproducts, getProductDetail, getCart, addToCart, updateCartItem,
  removeCartItem
} from "./apis";
import { useAuth } from "./context/AuthContext";
import Footer from "./components/Footer";
import ResetPassword from "./components/ResetPassword";

function App() {
  const [section, setSection] = useState("home");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [resetData, setResetData] = useState({ uid: null, token: null });
  const [verificationData, setVerificationData] = useState({ uidb64: null, token: null });
  const { isLoggedIn } = useAuth();

  // Debug: Log section changes
  useEffect(() => {
    console.log("Current section:", section);
  }, [section]);

  const handleOrderCreated = (orderData) => {
    setCartItems([]);
    setCurrentOrder(orderData);
    setSection('order-confirmation');
  };

  const fetchCart = async () => {
    try {
      const res = await getCart();
      if (res.success) {
        setCartItems(res.items);
      }
    } catch (err) {
      console.error(err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Check for password reset URL
    const resetPasswordMatch = window.location.pathname.match(/\/reset-password\/([^/]+)\/([^/]+)/);
    if (resetPasswordMatch) {
      setResetData({ uid: resetPasswordMatch[1], token: resetPasswordMatch[2] });
      setSection("reset-password");
      return;
    }

    // Check for email verification URL
    const verifyMatch = window.location.pathname.match(/\/verify-email\/([^/]+)\/([^/]+)/);
    if (verifyMatch) {
      setVerificationData({ uidb64: verifyMatch[1], token: verifyMatch[2] });
      setSection("verify-email");
      return;
    }

    // Clean up URL after processing
    if (window.location.pathname !== "/") {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    const res = await getproducts(query);
    if (res.success) {
      setSearchResults(res.products);
      setSection("searchResults");
    }
  };

  const handleProductClick = async (product) => {
    if (!isLoggedIn) {
      setSection("login");
      return;
    }

    try {
      const res = await getProductDetail(product.id);
      if (res.success) {
        setSelectedProduct(res.productdetial);
        setSection("productDetail");
      } else {
        console.error("Failed to fetch product details", res.error);
      }
    } catch (err) {
      console.error("Error fetching product detail:", err);
    }
  };

  const handleUpdateCart = async (itemId, quantity) => {
    try {
      const res = await updateCartItem(itemId, quantity);
      if (res.success) {
        await fetchCart();
      } else {
        alert("Failed to update quantity");
      }
    } catch (err) {
      console.error("Update cart failed", err);
      alert("Failed to update quantity");
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const res = await removeCartItem(itemId);
      if (res.success) {
        await fetchCart();
      } else {
        alert("Failed to remove item");
      }
    } catch (err) {
      console.error("Remove from cart failed", err);
      alert("Failed to remove item");
    }
  };

  const handleBackFromProduct = () => {
    if (searchResults.length > 0) setSection("searchResults");
    else setSection("home");
    setSelectedProduct(null);
  };

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      setSection("login");
      return;
    }
    await fetchCart();
    setSection("cart");
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!isLoggedIn) {
      setSection("login");
      return;
    }

    try {
      const res = await addToCart(product.id, quantity);
      if (res.success) {
        await fetchCart();
        alert("Product added to cart!");
      } else {
        alert("Failed to add product to cart");
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Failed to add product to cart");
    }
  };

  return (
    <>
      <Navbar
        setSection={setSection}
        onSearch={handleSearch}
        onCartClick={handleCartClick}
        currentSection={section}
      />

      {section === "home" && (
        <Home
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      )}

      {section === "profile" && (
        <Profile onBack={() => setSection("home")} />
      )}

      {section === "login" && <Login setSection={setSection} />}

      {section === "searchResults" && (
        <SearchResults
          products={searchResults}
          onProductClick={handleProductClick}
          onBackToHome={() => setSection("home")}
        />
      )}

      {section === "productDetail" && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackFromProduct}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      )}

      {section === "cart" && (
        <Cart
          items={cartItems}
          onBack={() => setSection("home")}
          onUpdateCart={handleUpdateCart}
          onRemoveFromCart={handleRemoveFromCart}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {section === "orders" && (
        <OrdersPage
          onBack={() => setSection("home")}
          onViewOrderDetail={(orderId) => {
            if (orderId) {
              setCurrentOrderId(orderId);
              setSection('order-detail');
            } else {
              console.error("Invalid order ID:", orderId);
            }
          }}
        />
      )}

      {section === "order-detail" && (
        <OrderDetailPage
          orderId={currentOrderId}
          onBack={() => setSection("orders")}
        />
      )}

      {section === "order-confirmation" && (
        <OrderConfirmation
          order={currentOrder}
          onBack={() => setSection("home")}
          onViewOrders={() => setSection("orders")}
        />
      )}

      {section === "register" && (
        <Register
          setSection={setSection}
          onSwitchToLogin={() => setSection("login")}
        />
      )}

      {section === "about" && <About onBack={() => setSection("home")} />}

      {section === "process" && <Process onBack={() => setSection("home")} />}

      {section === "contact" && <Contact onBack={() => setSection("home")} />}

      {section === "reset-password" && (
        <ResetPassword uid={resetData.uid} token={resetData.token} setSection={setSection} />
      )}

      {section === "verify-email" && (
        <EmailVerification
          uidb64={verificationData.uidb64}
          token={verificationData.token}
          setSection={setSection}
        />
      )}

      <Footer />
    </>
  );
}

export default App;