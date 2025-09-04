// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { getCategories } from "../apis";
import Category from "../components/Category";

const Home = () => {

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-[1400px] mx-auto px-6 py-16">
                <h1 className="text-5xl font-bold text-center mb-6 text-gray-800">
                    Welcome to sToRe
                </h1>
                <p className="text-lg text-gray-700 text-center mb-12">
                    Your one-stop shop for amazing products!
                </p>
                <Category />

            </div>
        </div>
    );
};

export default Home;
