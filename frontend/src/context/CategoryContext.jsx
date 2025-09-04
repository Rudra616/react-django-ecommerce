// src/context/CategoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCategories, getCategoryProducts } from '../api/categoryApi';

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchCategories();
      setHasFetched(true);
    }
  }, [hasFetched]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();

      // Handle different API response formats
      let categoriesData = [];

      if (Array.isArray(response)) {
        // If response is already an array
        categoriesData = response;
      } else if (response && Array.isArray(response.results)) {
        // If response has results array (pagination)
        categoriesData = response.results;
      } else if (response && typeof response === 'object') {
        // If response is an object, convert to array
        categoriesData = Object.values(response);
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId) => {
    try {
      setLoading(true);
      const response = await getCategoryProducts(categoryId);

      // Handle different API response formats
      let productsData = [];

      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.results)) {
        productsData = response.results;
      } else if (response && typeof response === 'object') {
        productsData = Object.values(response);
      }

      setCategoryProducts(productsData);
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('Error fetching category products:', error);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const clearCategorySelection = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  const value = {
    categories,
    categoryProducts,
    selectedCategory,
    loading,
    fetchCategories,
    fetchCategoryProducts,
    clearCategorySelection
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};