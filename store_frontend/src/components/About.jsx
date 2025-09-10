// components/About.jsx
import React from 'react';

const About = ({ onBack }) => {
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
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">About Us</h1>

                    <div className="prose prose-lg max-w-none">
                        <div className="text-center mb-8">
                            <div className="w-32 h-32 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-4xl text-white">sToRe</span>
                            </div>
                            <p className="text-gray-600 text-xl">Your trusted shopping destination</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
                                <p className="text-gray-600">
                                    Founded in 2024, sToRe started with a simple mission: to provide high-quality products
                                    at affordable prices with exceptional customer service. We believe that everyone deserves
                                    access to the best products without breaking the bank.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
                                <p className="text-gray-600">
                                    To revolutionize the online shopping experience by offering curated products,
                                    fast delivery, and customer-centric services. We're committed to sustainability
                                    and ethical business practices.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Us?</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { title: "Quality Products", desc: "Carefully curated selection" },
                                    { title: "Fast Delivery", desc: "Quick and reliable shipping" },
                                    { title: "24/7 Support", desc: "Always here to help you" },
                                    { title: "Secure Payments", desc: "Safe and encrypted transactions" }
                                ].map((item, index) => (
                                    <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-orange-500 font-bold">{index + 1}</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;