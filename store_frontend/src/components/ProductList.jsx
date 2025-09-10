// src/components/ProductList.jsx
import React from "react";

const ProductList = ({ products, onProductClick, loading }) => {
    if (loading) return <p className="text-gray-600">Loading products...</p>;
    if (!products.length) return <p className="text-gray-600">No products found.</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="p-4 rounded shadow text-center cursor-pointer hover:shadow-lg"
                    onClick={() => onProductClick(product)}
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="mx-auto mb-2 h-24 w-24 object-cover rounded-full"
                    />
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
