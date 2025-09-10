// components/ReviewList.jsx - Updated version
import React, { useState, useEffect } from "react";
import { getProductReviews, deleteProductReview, updateProductReview } from "../apis";
import ReviewItem from "./ReviewItem";
import { useAuth } from "../context/AuthContext";

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const result = await getProductReviews(productId);

            if (result.success) {
                setReviews(result.reviews);
                // Ensure averageRating is a number
                const avgRating = typeof result.averageRating === 'number'
                    ? result.averageRating
                    : 0;
                setAverageRating(avgRating);
                setTotalReviews(result.count);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            const result = await deleteProductReview(reviewId);
            if (result.success) {
                setReviews(reviews.filter(review => review.id !== reviewId));
                setTotalReviews(prev => prev - 1);
                // Recalculate average rating
                const remainingReviews = reviews.filter(review => review.id !== reviewId);
                const newAverage = remainingReviews.length > 0
                    ? remainingReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / remainingReviews.length
                    : 0;
                setAverageRating(newAverage);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to delete review");
        }
    };

    const handleEditReview = async (reviewId, reviewData) => {
        try {
            const result = await updateProductReview(reviewId, reviewData);
            if (result.success) {
                // Update the review in the list
                const updatedReviews = reviews.map(review =>
                    review.id === reviewId ? result.review : review
                );
                setReviews(updatedReviews);

                // Recalculate average rating
                const newAverage = updatedReviews.length > 0
                    ? updatedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / updatedReviews.length
                    : 0;
                setAverageRating(newAverage);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to update review");
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 h-20 rounded"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                        {typeof averageRating === 'number' && averageRating > 0
                            ? averageRating.toFixed(1)
                            : '0'
                        }/5
                    </div>
                    <div className="text-sm text-gray-600">
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this product!
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onDelete={handleDeleteReview}
                            onEdit={handleEditReview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;