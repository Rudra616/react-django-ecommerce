// src/api/reviewApi.js
import axiosInstance from './axiosConfig';

export const getProductReviews = async (productId) => {
    try {
        const response = await axiosInstance.get(`products/${productId}/reviews/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createReview = async (productId, reviewData) => {
    try {
        const response = await axiosInstance.post(`products/${productId}/reviews/`, reviewData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateReview = async (reviewId, reviewData) => {
    try {
        const response = await axiosInstance.patch(`reviews/${reviewId}/`, reviewData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        await axiosInstance.delete(`reviews/${reviewId}/`);
    } catch (error) {
        throw error.response?.data || error;
    }
};