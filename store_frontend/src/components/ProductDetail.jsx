// components/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { getUserProductReview, addToCart, getProductReviews } from "../apis";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import { useAuth } from "../context/AuthContext";
import ErrorBoundary from './ErrorBoundary';

const ProductDetail = ({ product, onBack, onAddToCart, cartItems }) => {
    const [currentSection, setCurrentSection] = useState("details");
    const [userReview, setUserReview] = useState(null);
    const [loadingUserReview, setLoadingUserReview] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const { isLoggedIn } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        const fetchUserReview = async () => {
            if (product?.id && isLoggedIn) {
                try {
                    const result = await getUserProductReview(product.id);
                    if (result.success) {
                        setUserReview(result.review);
                    }
                } catch (error) {
                    console.error("Error fetching user review:", error);
                } finally {
                    setLoadingUserReview(false);
                }
            } else {
                setLoadingUserReview(false);
            }
        };

        const fetchReviews = async () => {
            if (product?.id) {
                setLoadingReviews(true);
                try {
                    const result = await getProductReviews(product.id);
                    if (result.success) {
                        setReviews(result.reviews);
                    }
                } catch (error) {
                    console.error("Error fetching reviews:", error);
                } finally {
                    setLoadingReviews(false);
                }
            }
        };

        fetchUserReview();
        fetchReviews();
    }, [product?.id, isLoggedIn]);

    const handleReviewSubmitted = (newReview) => {
        setUserReview(newReview);
        // Refresh reviews list
        getProductReviews(product.id).then(result => {
            if (result.success) {
                setReviews(result.reviews);
            }
        });
        setCartMessage("Review submitted successfully!");
        setTimeout(() => setCartMessage(""), 3000);
    };

    const handleAddToCartClick = async () => {
        if (!isLoggedIn) {
            setCartMessage("Please login to add items to cart");
            setTimeout(() => setCartMessage(""), 3000);
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result.success) {
                setCartMessage("Product added to cart successfully!");
                if (onAddToCart) {
                    onAddToCart(product, quantity);
                }
            } else {
                setCartMessage(result.error || "Failed to add product to cart");
            }
        } catch (error) {
            setCartMessage("An error occurred while adding to cart");
        } finally {
            setAddingToCart(false);
            setTimeout(() => setCartMessage(""), 3000);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-yellow-400" />);
            }
        }

        return stars;
    };

    const isInCart = cartItems.some(item => item.product?.id === product.id);

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Product not found</p>
                    <button
                        onClick={onBack}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Products
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Product Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden">
                            {product.image ? (
                                <img
                                    src={product.image_url || product.image} // Try both fields
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-4xl">🛒</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                            <div className="flex mr-2">
                                {renderStars(product.average_rating || 0)}
                            </div>
                            <span className="text-gray-600">
                                ({reviews.length} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-3xl font-bold text-orange-600">
                                ${product.price}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                                <span className="ml-2 text-lg text-gray-500 line-through">
                                    ${product.original_price}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {product.description || "No description available."}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                            </span>
                        </div>

                        {/* Add to Cart Section */}
                        {product.stock > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {[...Array(Math.min(product.stock, 5))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddToCartClick}
                                    disabled={addingToCart || isInCart}
                                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                >
                                    {addingToCart ? (
                                        "Adding to Cart..."
                                    ) : isInCart ? (
                                        "Already in Cart"
                                    ) : (
                                        <>
                                            <FaShoppingCart className="mr-2" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Cart Message */}
                        {cartMessage && (
                            <div className={`p-3 rounded-lg text-center ${cartMessage.includes("success")
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                                }`}>
                                {cartMessage}
                            </div>
                        )}


                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setCurrentSection("details")}
                                className={`py-4 px-6 border-b-2 font-medium text-sm ${currentSection === "details"
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                Product Details
                            </button>
                            <button
                                onClick={() => setCurrentSection("reviews")}
                                className={`py-4 px-6 border-b-2 font-medium text-sm ${currentSection === "reviews"
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                Reviews ({reviews.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {currentSection === "details" && (
                            <div className="prose max-w-none">
                                <h3>Detailed Description</h3>
                                <p className="text-gray-700">
                                    {product.description || "No detailed description available."}
                                </p>
                            </div>
                        )}

                        {currentSection === "reviews" && (
                            <div className="space-y-8">
                                {/* Review Form */}
                                <ReviewForm
                                    productId={product.id}
                                    onReviewSubmitted={handleReviewSubmitted}
                                />

                                {/* Reviews List */}
                                {loadingReviews ? (
                                    <div className="animate-pulse space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-gray-200 h-20 rounded"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <ErrorBoundary>
                                        <ReviewList productId={product.id} />
                                    </ErrorBoundary>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;