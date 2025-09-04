// src/components/ProductCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth(); // ✅ Get user from AuthContext
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            // Redirect to login or show message
            if (window.confirm('Please login to add items to cart. Would you like to login now?')) {
                navigate('/login');
            }
            return;
        }

        addToCart(product, 1);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Out of Stock
                        </div>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Low Stock
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg text-gray-800 hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                    </span>
                    <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-600 ml-1">
                            {product.rating || '4.5'} ({product.reviews || '120'})
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;