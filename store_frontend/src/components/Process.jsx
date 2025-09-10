// components/Process.jsx
import React from 'react';

const Process = ({ onBack }) => {
    const steps = [
        {
            number: "01",
            title: "Browse Products",
            description: "Explore our wide range of categories and discover amazing products",
            icon: "🔍"
        },
        {
            number: "02",
            title: "Add to Cart",
            description: "Select your favorite items and add them to your shopping cart",
            icon: "🛒"
        },
        {
            number: "03",
            title: "Secure Checkout",
            description: "Complete your purchase with our safe and encrypted payment system",
            icon: "💳"
        },
        {
            number: "04",
            title: "Fast Delivery",
            description: "Receive your order quickly with our reliable shipping partners",
            icon: "🚚"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={onBack}
                    className="mb-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                    ← Back to Home
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Process</h1>
                    <p className="text-gray-600 text-center text-lg mb-12 max-w-2xl mx-auto">
                        Simple, transparent, and customer-focused shopping experience from start to finish
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.number}
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>

                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-300"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-orange-50 rounded-xl p-8">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                            Ready to Start Shopping?
                        </h2>
                        <div className="text-center">
                            <button
                                onClick={() => window.location.href = "/"}
                                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                            >
                                Explore Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Process;