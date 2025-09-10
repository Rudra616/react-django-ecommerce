// components/ReviewForm.jsx
import React, { useState, useEffect } from "react";
import { createProductReview, updateProductReview, getUserProductReview } from "../apis";
import { useAuth } from "../context/AuthContext";

const ReviewForm = ({ productId, onReviewSubmitted, onCancel }) => {
    const [formData, setFormData] = useState({
        rating: 0,
        title: "",
        comment: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const fetchUserReview = async () => {
            if (isLoggedIn && productId) {
                try {
                    const result = await getUserProductReview(productId);
                    if (result.success && result.review) {
                        setExistingReview(result.review);
                        setFormData({
                            rating: result.review.rating,
                            title: result.review.title || "",
                            comment: result.review.comment || ""
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user review:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserReview();
    }, [productId, isLoggedIn]);

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: "" }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            setErrors({ non_field_errors: ["Please login to submit a review"] });
            return;
        }

        if (formData.rating === 0) {
            setErrors(prev => ({ ...prev, rating: "Please select a rating" }));
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const reviewData = {
                rating: formData.rating,
                title: formData.title,
                comment: formData.comment
            };

            let result;
            if (existingReview) {
                result = await updateProductReview(existingReview.id, reviewData);
            } else {
                result = await createProductReview(productId, reviewData);
            }

            if (result.success) {
                onReviewSubmitted(result.review);
                if (!existingReview) {
                    setFormData({ rating: 0, title: "", comment: "" });
                }
                // If it was an update, keep the existing review reference
                if (existingReview && result.review) {
                    setExistingReview(result.review);
                }
            } else {
                if (result.alreadyReviewed && result.existingReview) {
                    // If user already reviewed and we have the review data
                    setExistingReview(result.existingReview);
                    setFormData({
                        rating: result.existingReview.rating,
                        title: result.existingReview.title || "",
                        comment: result.existingReview.comment || ""
                    });
                    setErrors({ non_field_errors: [result.error] });
                } else if (result.alreadyReviewed) {
                    // If user already reviewed but we don't have review data, fetch it
                    const userReviewResult = await getUserProductReview(productId);
                    if (userReviewResult.success && userReviewResult.review) {
                        setExistingReview(userReviewResult.review);
                        setFormData({
                            rating: userReviewResult.review.rating,
                            title: userReviewResult.review.title || "",
                            comment: userReviewResult.review.comment || ""
                        });
                    }
                    setErrors({ non_field_errors: [result.error] });
                } else {
                    setErrors(result.fieldErrors || { non_field_errors: result.error });
                }
            }
        } catch (error) {
            setErrors({ non_field_errors: ["An unexpected error occurred"] });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800">Please login to leave a review</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
                {existingReview ? "Edit Your Review" : "Write a Review"}
            </h3>

            {errors.non_field_errors && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    {Array.isArray(errors.non_field_errors)
                        ? errors.non_field_errors.map((error, index) => (
                            <p key={index} className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        ))
                        : errors.non_field_errors
                    }
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                </label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className={`text-2xl focus:outline-none ${star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                                } hover:text-yellow-500 transition-colors`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {errors.rating && (
                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter a title for your review"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comment
                </label>
                <textarea
                    id="comment"
                    name="comment"
                    rows="4"
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Share your experience with this product"
                />
                {errors.comment && (
                    <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                )}
            </div>

            <div className="flex space-x-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {existingReview && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> You've already reviewed this product.
                        You can edit your review above or{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setExistingReview(null);
                                setFormData({ rating: 0, title: "", comment: "" });
                            }}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            start a new review
                        </button>
                        .
                    </p>
                </div>
            )}
        </form>
    );
};

export default ReviewForm;