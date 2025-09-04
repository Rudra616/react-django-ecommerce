// src/components/CategoryList.jsx
import React from 'react';
import { useCategory } from '../context/CategoryContext';

const CategoryList = ({ selectedCategory, onCategorySelect }) => {
    const { categories = [], loading } = useCategory();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Ensure categories is always an array before mapping
    const safeCategories = Array.isArray(categories) ? categories : [];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
            <div className="space-y-2">
                <button
                    onClick={() => onCategorySelect('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${selectedCategory === 'all'
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    All Categories
                </button>

                {/* Safe mapping with array check */}
                {safeCategories.map((category) => (
                    <button
                        key={category.id || category._id || Math.random()}
                        onClick={() => onCategorySelect(category.id || category._id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${selectedCategory === (category.id || category._id)
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {category.name || 'Unnamed Category'}
                    </button>
                ))}

                {/* Show message if no categories */}
                {safeCategories.length === 0 && !loading && (
                    <p className="text-gray-500 text-sm text-center py-4">
                        No categories available
                    </p>
                )}
            </div>
        </div>
    );
};

export default CategoryList;