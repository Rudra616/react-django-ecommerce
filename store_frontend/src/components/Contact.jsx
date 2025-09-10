// components/Contact.jsx
import React, { useState } from 'react';

const Contact = ({ onBack }) => {
    const [activeFAQ, setActiveFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setActiveFAQ(activeFAQ === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={onBack}
                    className="mb-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Contact Us</h1>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: "📧",
                                        title: "Email Support",
                                        content: "support@ecommercestore.com",
                                        link: "mailto:support@ecommercestore.com",
                                        description: "For order issues and product questions"
                                    },
                                    {
                                        icon: "📞",
                                        title: "Phone Support",
                                        content: "+1 (555) 123-4567",
                                        link: "tel:+15551234567",
                                        description: "Mon-Fri: 9AM-6PM EST"
                                    },
                                    {
                                        icon: "💬",
                                        title: "Live Chat",
                                        content: "Available 24/7",
                                        link: "#chat",
                                        description: "Instant help with any questions"
                                    },
                                    {
                                        icon: "📮",
                                        title: "Returns & Exchanges",
                                        content: "returns@ecommercestore.com",
                                        link: "mailto:returns@ecommercestore.com",
                                        description: "For return requests and exchange inquiries"
                                    },
                                    {
                                        icon: "🤝",
                                        title: "Business Inquiries",
                                        content: "partners@ecommercestore.com",
                                        link: "mailto:partners@ecommercestore.com",
                                        description: "For wholesale and partnership opportunities"
                                    },
                                    {
                                        icon: "📍",
                                        title: "Corporate Office",
                                        content: "123 Commerce Street, Business City, BC 12345",
                                        link: "#",
                                        description: "Visit by appointment only"
                                    }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                            <p className="text-gray-600">{item.content}</p>
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                            {item.link && item.link !== "#" && (
                                                <a href={item.link} className="text-orange-500 hover:text-orange-600 text-sm font-medium inline-block mt-2">
                                                    Contact us
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>

                            <div className="space-y-4">
                                {[
                                    {
                                        question: "How can I track my order?",
                                        answer: "Once your order ships, you'll receive a tracking number via email. You can also check your order status by logging into your account."
                                    },
                                    {
                                        question: "What is your return policy?",
                                        answer: "We offer a 30-day return policy for unused items in their original packaging. Some items may have different return policies which will be noted on the product page."
                                    },
                                    {
                                        question: "Do you ship internationally?",
                                        answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
                                    },
                                    {
                                        question: "How do I apply a discount code?",
                                        answer: "You can enter your discount code during checkout in the 'Promo Code' field before completing your purchase."
                                    },
                                    {
                                        question: "What payment methods do you accept?",
                                        answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay."
                                    },
                                    {
                                        question: "How do I change or cancel my order?",
                                        answer: "Orders can be modified or canceled within 1 hour of placement. Contact our support team immediately for assistance."
                                    }
                                ].map((faq, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition"
                                            onClick={() => toggleFAQ(index)}
                                        >
                                            <span className="font-medium text-gray-800 text-left">{faq.question}</span>
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transform transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {activeFAQ === index && (
                                            <div className="p-4 bg-white">
                                                <p className="text-gray-600">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-orange-50 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">Still need help?</h3>
                                <p className="text-gray-600 mb-4">Check our complete Help Center for more answers to common questions.</p>
                                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                    Visit Help Center
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;