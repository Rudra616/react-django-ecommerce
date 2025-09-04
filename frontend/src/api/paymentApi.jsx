// src/api/paymentApi.js
import axiosInstance from './axiosConfig';

export const createPayment = async (paymentData) => {
    try {
        const response = await axiosInstance.post('payments/', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getPayment = async (paymentId) => {
    try {
        const response = await axiosInstance.get(`payments/${paymentId}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const processPayment = async (orderId, paymentMethod) => {
    try {
        const response = await axiosInstance.post('payments/process/', {
            order: orderId,
            payment_method: paymentMethod
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};