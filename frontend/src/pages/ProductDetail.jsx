// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProduct, getProductReviews } from '../api/productApi';
import { createReview } from '../api/reviewApi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [hasUserReviewed, setHasUserReviewed] = useState(false);

    // Memoized fetchReviews function
    const fetchReviews = useCallback(async () => {
        try {
            const response = await getProductReviews(id);

            // Handle different API response formats
            let reviewsData = [];

            if (Array.isArray(response)) {
                reviewsData = response;
            } else if (response && Array.isArray(response.results)) {
                reviewsData = response.results;
            } else if (response && typeof response === 'object') {
                // Handle object format - extract values if it's an object of objects
                reviewsData = Object.values(response);
            } else {
                console.warn('Unexpected API response format:', response);
                reviewsData = [];
            }

            setReviews(reviewsData);

            // Check if current user has already reviewed this product
            if (user && reviewsData.length > 0) {
                const userReview = reviewsData.find(review => {
                    // Handle different user identifier formats
                    const reviewUserId = review.user?.id || review.user_id || review.user;
                    const currentUserId = user.id || user.user_id;
                    const reviewUsername = review.user?.username || review.user;
                    const currentUsername = user.username;

                    return reviewUserId === currentUserId || reviewUsername === currentUsername;
                });
                setHasUserReviewed(!!userReview);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Don't show error to user for reviews - they're non-essential
            setReviews([]);
        }
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError('');
            const productData = await getProduct(id);
            setProduct(productData);
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id, fetchReviews]); // Added fetchReviews to dependencies
    // In your ProductDetail.jsx - update the handleAddToCart function
    const handleAddToCart = async () => {
        if (!user) {
            setError('Please login to add items to cart.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            await addToCart(product, quantity);
            setSuccessMessage('Product added to cart successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.message.includes('Please login')) {
                setError('Please login to add items to cart.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Failed to add product to cart. Please try again.');
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please login to submit a review.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (hasUserReviewed) {
            setError('You have already reviewed this product.');
            return;
        }

        setReviewLoading(true);
        setError('');

        try {
            await createReview(id, reviewForm);
            setReviewForm({ rating: 5, comment: '' });
            setSuccessMessage('Review submitted successfully!');
            setHasUserReviewed(true);
            fetchReviews(); // Refresh reviews

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error submitting review:', error);
            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
                // If the error says user already reviewed, update state
                if (error.response.data.detail.includes('already reviewed')) {
                    setHasUserReviewed(true);
                }
            } else if (error.response?.data?.non_field_errors) {
                setError(error.response.data.non_field_errors[0]);
            } else if (error.response?.status === 401) {
                setError('Please login to submit a review.');
            } else if (error.response?.status === 400) {
                setError('Invalid review data. Please check your input.');
            } else {
                setError('Failed to submit review. Please try again.');
            }
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h1>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        <li><button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button></li>
                        <li>→</li>
                        <li><button onClick={() => navigate('/products')} className="hover:text-blue-600">Products</button></li>
                        <li>→</li>
                        <li className="text-gray-800 truncate max-w-xs">{product.name}</li>
                    </ol>
                </nav>

                {/* Error and Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="text-red-700 hover:text-red-800 text-lg"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <span>{successMessage}</span>
                            <button
                                onClick={() => setSuccessMessage('')}
                                className="text-green-700 hover:text-green-800 text-lg"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <img
                            src={product.image || "https://via.placeholder.com/400x400"}
                            alt={product.name}
                            className="w-full h-96 object-contain rounded-lg"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x400";
                            }}
                        />
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {'⭐'.repeat(5)}
                            </div>
                            <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
                        </div>

                        <p className="text-3xl font-bold text-blue-600 mb-6">${product.price}</p>

                        <p className="text-gray-600 mb-6">{product.description}</p>

                        <div className="flex items-center mb-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    -
                                </button>
                                <span className="px-4 py-2 font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    disabled={product.stock > 0 && quantity >= product.stock}
                                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${product.stock === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Category: {product.category?.name || 'Uncategorized'}</li>
                                <li>• SKU: #{product.id}</li>
                                <li>• Availability: {product.stock} units in stock</li>
                                <li>• Weight: 1.2 lbs</li>
                                <li>• Dimensions: 10 × 5 × 3 in</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`py-4 px-6 font-medium ${activeTab === 'description'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-4 px-6 font-medium ${activeTab === 'reviews'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Reviews ({reviews.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'description' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Product Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>

                                {product.features && (
                                    <div className="mt-6">
                                        <h4 className="font-medium text-gray-800 mb-3">Key Features</h4>
                                        <ul className="text-gray-600 space-y-2">
                                            {product.features.split('\n').map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-green-500 mr-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-6">Customer Reviews</h3>

                                {/* Review Form */}
                                {user ? (
                                    hasUserReviewed ? (
                                        <div className="bg-blue-50 border border-blue-200 text-blue-600 p-6 rounded-lg mb-8">
                                            <h4 className="font-medium mb-2">You've already reviewed this product</h4>
                                            <p>Thank you for your feedback! Each customer can only submit one review per product.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-lg mb-8">
                                            <h4 className="font-medium text-gray-800 mb-4">Write a Review</h4>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                                <select
                                                    value={reviewForm.rating}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value={5}>5 Stars - Excellent</option>
                                                    <option value={4}>4 Stars - Very Good</option>
                                                    <option value={3}>3 Stars - Good</option>
                                                    <option value={2}>2 Stars - Fair</option>
                                                    <option value={1}>1 Star - Poor</option>
                                                </select>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                                <textarea
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Share your experience with this product. What did you like? What could be improved?"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={reviewLoading}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                            >
                                                {reviewLoading ? 'Submitting Review...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    )
                                ) : (
                                    <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
                                        <p className="text-gray-600 mb-4">Please login to leave a review.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Login to Review
                                        </button>
                                    </div>
                                )}

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">💬</div>
                                        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="flex text-yellow-400">
                                                            {'⭐'.repeat(review.rating)}
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-600">
                                                            {review.user?.username || review.user || 'Anonymous'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 mb-2">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;