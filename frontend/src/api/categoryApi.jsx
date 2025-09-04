// src/api/categoryApi.js
import axiosInstance from './axiosConfig';

export const getCategories = async () => {
    try {
        const response = await axiosInstance.get('categories/');
        console.log('Categories API response:', response.data); // ✅ Debug log
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error.response?.data || error;
    }
};

export const getCategoryProducts = async (categoryId) => {
    try {
        const response = await axiosInstance.get(`categories/${categoryId}/products/`);
        console.log('Category products API response:', response.data); // ✅ Debug log
        return response.data;
    } catch (error) {
        console.error('Error fetching category products:', error);
        throw error.response?.data || error;
    }
};