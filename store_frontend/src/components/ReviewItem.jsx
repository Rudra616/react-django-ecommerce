// components/ReviewItem.jsx - Updated version
import React, { useState } from "react";
import { FaTrash, FaEdit, FaUserCircle, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const ReviewItem = ({ review, onDelete, onEdit }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        rating: review.rating,
        title: review.title || "",
        comment: review.comment || ""
    });

    const { user } = useAuth();

    // Check if current user is the review creator
    const isReviewCreator = user && (
        (review.user && review.user.id === user.id) ||
        (review.user_id && review.user_id === user.id) ||
        review.is_current_user_review
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating, editable = false, onChange = null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className={i < rating ? "text-yellow-400" : "text-gray-300"}
                onClick={() => editable && onChange && onChange(i + 1)}
                style={editable ? { cursor: 'pointer' } : {}}
            >
                ★
            </span>
        ));
    };

    const handleDeleteClick = () => {
        if (showDeleteConfirm) {
            onDelete(review.id);
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditForm({
            rating: review.rating,
            title: review.title || "",
            comment: review.comment || ""
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            rating: review.rating,
            title: review.title || "",
            comment: review.comment || ""
        });
    };

    const handleSaveEdit = () => {
        onEdit(review.id, editForm);
        setIsEditing(false);
    };

    const handleRatingChange = (rating) => {
        setEditForm(prev => ({ ...prev, rating }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    if (isEditing) {
        return (
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Editing Your Review</h4>
                    <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <div className="flex space-x-1">
                        {renderStars(editForm.rating, true, handleRatingChange)}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Comment
                    </label>
                    <textarea
                        name="comment"
                        rows="4"
                        value={editForm.comment}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.user_name ? (
                            review.user_name.charAt(0).toUpperCase()
                        ) : (
                            <FaUserCircle className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <span className="font-medium text-gray-900 block">
                            {review.user_name || 'Anonymous Customer'}
                        </span>
                        <span className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                        </span>
                    </div>
                </div>

                {/* Only show edit/delete buttons to the review creator */}
                {isReviewCreator && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleEditClick}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit review"
                        >
                            <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className={`p-2 rounded-full transition-colors ${showDeleteConfirm
                                ? "bg-red-100 text-red-600"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                }`}
                            title={showDeleteConfirm ? "Click again to confirm" : "Delete review"}
                        >
                            <FaTrash className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center mb-3">
                <div className="flex mr-3">
                    {renderStars(review.rating)}
                </div>
                {review.title && (
                    <h4 className="font-semibold text-lg text-gray-900">{review.title}</h4>
                )}
            </div>

            {review.comment && (
                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
            )}

            {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                    <p className="text-red-700 text-sm">Are you sure? Click the trash icon again to delete.</p>
                </div>
            )}

            {review.verified_purchase && (
                <div className="flex items-center text-sm text-green-600 mt-2">
                    <span className="bg-green-100 px-2 py-1 rounded-full">Verified Purchase</span>
                </div>
            )}
        </div>
    );
};

export default ReviewItem;