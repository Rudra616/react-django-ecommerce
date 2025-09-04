// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from "react";
import { getCategories, getProductsByCategory } from "../apis";

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getCategories();
                if (res.success && Array.isArray(res.categories) && res.categories.length > 0) {
                    setCategories(res.categories);
                } else {
                    setCategories([]);
                    setError("No categories found.");
                }
            } catch (err) {
                setCategories([]);
                setError("Failed to fetch categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch products when a category is clicked
    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setLoadingProducts(true);
        setProducts([]);
        try {
            const res = await getProductsByCategory(category.id);
            if (res.success && Array.isArray(res.products) && res.products.length > 0) {
                setProducts(res.products);
            } else {
                setProducts([]);
            }
        } catch (err) {
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Go back to categories view
    const handleBack = () => {
        setSelectedCategory(null);
        setProducts([]);
    };

    return (
        <div className="p-6">
            {!selectedCategory ? (
                <>
                    <h2 className="text-2xl font-bold text-center mb-6">Categories</h2>
                    {loading ? (
                        <p className="text-center text-gray-600">Loading categories...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="mx-auto mb-2 h-24 w-24 object-cover rounded-full"
                                    />
                                    <h3 className="font-semibold text-lg">{category.name}</h3>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <button
                        onClick={handleBack}
                        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        ← Back to Categories
                    </button>

                    <h2 className="text-2xl font-bold text-center mb-6">
                        {selectedCategory.name} Products
                    </h2>

                    {loadingProducts ? (
                        <p className="text-center text-gray-600">Loading products...</p>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white p-4 rounded shadow hover:shadow-lg transition"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="mx-auto mb-2 h-40 w-full object-cover rounded"
                                    />
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <p className="text-gray-700">{product.price} ₹</p>
                                    <p className="text-gray-500 text-sm">{product.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">
                            No products available in this category.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default CategoryPage;
