// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getCart,
    addToCart as addToCartApi,
    updateCartItem,
    removeCartItem,
    clearCart as clearCartApi
} from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setError(null);
        }
    }, [user]);
    // In CartContext.jsx - Update the fetchCart function
    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const cartData = await getCart();

            console.log('📦 Raw cart API response:', cartData);

            // Ensure cartData is always an array
            let itemsArray = [];

            if (Array.isArray(cartData)) {
                itemsArray = cartData;
            } else if (cartData && Array.isArray(cartData.results)) {
                itemsArray = cartData.results;
            } else if (cartData && typeof cartData === 'object') {
                itemsArray = Object.values(cartData);
            }

            // If items have product_id but no product object, we need to fetch product details
            const itemsWithProducts = await Promise.all(
                itemsArray.map(async (item) => {
                    if (item.product_id && !item.product) {
                        try {
                            // You'll need to create a getProduct function in your productApi
                            const productResponse = await getProduct(item.product_id);
                            return {
                                ...item,
                                product: productResponse
                            };
                        } catch (error) {
                            console.error('Error fetching product details:', error);
                            return {
                                ...item,
                                product: {
                                    name: 'Unknown Product',
                                    price: 0,
                                    image: 'https://via.placeholder.com/80x80'
                                }
                            };
                        }
                    }
                    return item;
                })
            );

            setCartItems(itemsWithProducts);
        } catch (error) {
            console.error('❌ Error fetching cart:', error);
            setError(error.message);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };
    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            throw new Error('Please login to add items to cart');
        }

        try {
            setError(null);
            const response = await addToCartApi(product.id, quantity);

            // Refresh the cart to get the updated data
            await fetchCart();

            return response;
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            setError(error.message);
            throw error;
        }
    };

    const updateItemQuantity = async (itemId, quantity) => {
        try {
            setError(null);
            const response = await updateCartItem(itemId, quantity);
            await fetchCart(); // Refresh cart
            return response;
        } catch (error) {
            console.error('❌ Error updating cart item:', error);
            setError(error.message);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            setError(null);
            const response = await removeCartItem(itemId);
            setCartItems(response);
            return response;
        } catch (error) {
            console.error('❌ Error removing cart item:', error);
            setError(error.message);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            setError(null);
            await clearCartApi();
            setCartItems([]);
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            setError(error.message);
            throw error;
        }
    };

    const getCartTotal = () => {
        // Ensure cartItems is an array before using reduce
        if (!Array.isArray(cartItems)) {
            console.warn('⚠️ cartItems is not an array:', cartItems);
            return 0;
        }

        return cartItems.reduce((total, item) => {
            const price = item.product?.price || item.price || 0;
            return total + (price * (item.quantity || 1));
        }, 0);
    };

    const getCartCount = () => {
        // Ensure cartItems is an array before using reduce
        if (!Array.isArray(cartItems)) {
            console.warn('⚠️ cartItems is not an array:', cartItems);
            return 0;
        }

        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    };

    const isProductInCart = (productId) => {
        if (!Array.isArray(cartItems)) return false;
        return cartItems.some(item =>
            item.product?.id === productId ||
            item.product_id === productId
        );
    };

    const getProductQuantity = (productId) => {
        if (!Array.isArray(cartItems)) return 0;
        const item = cartItems.find(item =>
            item.product?.id === productId ||
            item.product_id === productId
        );
        return item ? item.quantity : 0;
    };

    const value = {
        cartItems,
        loading,
        error,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        getCartTotal,
        getCartCount,
        clearCart,
        fetchCart,
        isProductInCart,
        getProductQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};