// src/components/CategoryList.jsx
import React from "react";

const CategoryList = ({ categories, onCategoryClick, loading }) => {
    if (loading) return <p className="text-gray-600 mb-6">Loading categories...</p>;
    if (!categories.length) return <p className="text-gray-600 mb-6">No categories found.</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
                <div
                    key={category.id}
                    className="bg-white p-4 rounded shadow text-center cursor-pointer hover:shadow-lg"
                    onClick={() => onCategoryClick(category)}
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
    );
};

export default CategoryList;
