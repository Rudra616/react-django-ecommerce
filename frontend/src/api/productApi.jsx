// src/api/productApi.js
import axiosInstance from './axiosConfig';

export const getProducts = async (params = {}) => {
    try {
        const response = await axiosInstance.get('products/', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getProduct = async (id) => {
    try {
        const response = await axiosInstance.get(`products/${id}/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const searchProducts = async (query) => {
    try {
        const response = await axiosInstance.get('products/', {
            params: { search: query }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};


export const getProductReviews = async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/reviews/`);
    return response.data;
};