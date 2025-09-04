// src/api/orderApi.jsx
import axiosInstance from "./axiosConfig";

// Get all orders for logged-in user
export const getOrders = async () => {
    try {
        const response = await axiosInstance.get("orders/");
        return response.data; // should return { count, results: [...] }
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        throw error.response?.data || error;
    }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await axiosInstance.get(`orders/${orderId}/`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching order:", error);
        throw error.response?.data || error;
    }
};

// Create a new order
export const createOrder = async (orderData) => {
    try {
        const response = await axiosInstance.post("orders/", orderData);
        return response.data;
    } catch (error) {
        console.error("❌ Error creating order:", error);
        throw error.response?.data || error;
    }
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axiosInstance.patch(`orders/${orderId}/status/`, {
            status,
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error updating order status:", error);
        throw error.response?.data || error;
    }
};
