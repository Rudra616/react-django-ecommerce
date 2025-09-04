// src/api/cartApi.js
import axiosInstance from './axiosConfig';

export const getCart = async () => {
    try {
        const response = await axiosInstance.get('cart/');
        console.log('🛒 Cart API response:', response.data);
        console.log('📊 Response type:', typeof response.data);
        console.log('✅ Is array:', Array.isArray(response.data));

        // Handle different API response formats
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        } else if (response.data && typeof response.data === 'object') {
            return Object.values(response.data);
        } else {
            console.warn('⚠️ Unexpected cart response format, returning empty array');
            return [];
        }
    } catch (error) {
        console.error('❌ Get cart error:', error.response?.data);
        if (error.response?.status === 401) {
            return [];
        }
        throw error.response?.data || error;
    }
};

export const addToCart = async (productId, quantity = 1) => {
    try {
        const response = await axiosInstance.post('cart/', {
            product: productId,
            quantity: quantity
        });
        console.log('✅ Add to cart success:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Add to cart error:', error.response?.data);

        // If it's a duplicate error, try to update instead
        if (error.response?.status === 500 &&
            error.response?.data?.includes('duplicate key')) {
            console.log('🔄 Duplicate item detected, trying to update existing item');
            try {
                // First get the current cart to find the existing item
                const cart = await getCart();
                const existingItem = cart.find(item =>
                    item.product?.id === productId || item.product_id === productId
                );

                if (existingItem) {
                    // Update the existing item
                    return await updateCartItem(existingItem.id, existingItem.quantity + quantity);
                }
            } catch (updateError) {
                console.error('❌ Failed to update existing cart item:', updateError);
            }
        }

        throw error.response?.data || error;
    }
};

export const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await axiosInstance.patch(`cart/${itemId}/`, {
            quantity: quantity
        });
        console.log('✅ Update cart item success:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Update cart item error:', error.response?.data);
        throw error.response?.data || error;
    }
};

export const removeCartItem = async (itemId) => {
    try {
        await axiosInstance.delete(`cart/${itemId}/`);
        console.log('✅ Remove cart item success');
        // Return updated cart by fetching again
        const updatedCart = await getCart();
        return updatedCart;
    } catch (error) {
        console.error('❌ Remove cart item error:', error.response?.data);
        throw error.response?.data || error;
    }
};

export const clearCart = async () => {
    try {
        const cart = await getCart();
        for (const item of cart) {
            await removeCartItem(item.id);
        }
        return [];
    } catch (error) {
        console.error('❌ Clear cart error:', error);
        throw error;
    }
};