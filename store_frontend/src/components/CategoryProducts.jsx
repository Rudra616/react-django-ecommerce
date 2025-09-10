// components/CategoryProducts.jsx
import React from "react";
import ProductList from "./ProductList";

const CategoryProducts = ({ category, products, onBack, onProductClick, loading }) => {
    return (
        <div className="mb-12 px-2 sm:px-0">
            <button
                onClick={onBack}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
                ← Back to Categories
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{category.name} Products</h2>
            <ProductList products={products} onProductClick={onProductClick} loading={loading} />
        </div>
    );
};

export default CategoryProducts;