// src/pages/Categories.jsx
import React, { useEffect } from 'react';
import { useCategory } from '../context/CategoryContext';
import { Link } from 'react-router-dom';

const Categories = () => {
    const { categories, categoryProducts, selectedCategory, fetchCategoryProducts, fetchCategories, loading } = useCategory();

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop by Category</h1>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => fetchCategoryProducts(category.id)}
                            className={`bg-white rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                            <p className="text-gray-600 text-sm">Browse products</p>
                        </div>
                    ))}
                </div>

                {/* Category Products */}
                {selectedCategory && categoryProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Products in {categories.find(c => c.id === selectedCategory)?.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                                                <span className="text-sm text-gray-500">{product.stock} in stock</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedCategory && categoryProducts.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">😢</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-600">There are no products in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;