// components/SearchResults.jsx (Alternative)
import React from "react";
import ProductList from "./ProductList";

const SearchResults = ({ products, onProductClick, onBackToHome }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Search Results</h2>
                    <button
                        onClick={onBackToHome}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
                    >
                        ← Back to Home
                    </button>
                </div>

                {(!products || products.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-xl mb-6">No products found</p>
                        <button
                            onClick={onBackToHome}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <>
                        <ProductList products={products} onProductClick={onProductClick} loading={false} />
                        <div className="mt-8 text-center">
                            <button
                                onClick={onBackToHome}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                Back to Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;