// components/Footer.jsx
import React from "react";
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaCreditCard,
    FaTruck,
    FaShieldAlt,
    FaHeadset
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            {/* Top Section - Features */}
            <div className="bg-gray-800 py-8">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <FaTruck className="text-2xl text-orange-500" />,
                                title: "Free Shipping",
                                description: "Free shipping on orders over ₹500"
                            },
                            {
                                icon: <FaCreditCard className="text-2xl text-orange-500" />,
                                title: "Secure Payment",
                                description: "100% secure payment processing"
                            },
                            {
                                icon: <FaShieldAlt className="text-2xl text-orange-500" />,
                                title: "Quality Products",
                                description: "30 days return policy"
                            },
                            {
                                icon: <FaHeadset className="text-2xl text-orange-500" />,
                                title: "24/7 Support",
                                description: "Dedicated customer support"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-3">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-gray-300 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="py-12">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center mb-6">
                                <span className="text-2xl font-bold">s</span>
                                <span className="text-3xl text-orange-500 font-bold">To</span>
                                <span className="text-2xl font-bold">Re</span>
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Your trusted shopping destination for quality products at affordable prices.
                                We're committed to providing exceptional customer service and fast delivery.
                            </p>
                            <div className="flex space-x-4">
                                {[
                                    { icon: FaFacebook, url: "#", color: "hover:text-blue-500" },
                                    { icon: FaTwitter, url: "#", color: "hover:text-blue-400" },
                                    { icon: FaInstagram, url: "#", color: "hover:text-pink-500" },
                                    { icon: FaLinkedin, url: "#", color: "hover:text-blue-600" }
                                ].map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition ${social.color} hover:bg-gray-700`}
                                        aria-label={social.icon.name}
                                    >
                                        <social.icon className="text-lg" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Quick Links</h3>
                            <ul className="space-y-3">
                                {[
                                    { name: "Home", href: "#home" },
                                    { name: "Shop", href: "#shop" },
                                    { name: "About Us", href: "#about" },
                                    { name: "Contact", href: "#contact" },
                                    { name: "Privacy Policy", href: "#privacy" },
                                    { name: "Terms of Service", href: "#terms" }
                                ].map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-300 hover:text-orange-500 transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Categories</h3>
                            <ul className="space-y-3">
                                {[
                                    "Electronics",
                                    "Clothing",
                                    "Home & Kitchen",
                                    "Books",
                                    "Sports",
                                    "Beauty",
                                    "Toys",
                                    "Jewelry"
                                ].map((category, index) => (
                                    <li key={index}>
                                        <a
                                            href={`#${category.toLowerCase()}`}
                                            className="text-gray-300 hover:text-orange-500 transition-colors"
                                        >
                                            {category}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-300">
                                        123 Commerce Street<br />
                                        Business City, BC 12345
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaPhone className="text-orange-500 flex-shrink-0" />
                                    <a href="tel:+15551234567" className="text-gray-300 hover:text-orange-500 transition">
                                        +1 (555) 123-4567
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <FaEnvelope className="text-orange-500 flex-shrink-0" />
                                    <a href="mailto:support@store.com" className="text-gray-300 hover:text-orange-500 transition">
                                        support@store.com
                                    </a>
                                </div>
                            </div>

                            {/* Newsletter Subscription */}

                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 py-6">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © 2024 sToRe. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6">
                            <span className="text-gray-400 text-sm">We accept:</span>
                            <div className="flex space-x-2">
                                <div className="w-8 h-5 bg-gray-700 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-700 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-700 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-700 rounded-sm"></div>
                            </div>
                        </div>
                        <div className="flex space-x-6">
                            <a href="#privacy" className="text-gray-400 hover:text-orange-500 text-sm transition">
                                Privacy Policy
                            </a>
                            <a href="#terms" className="text-gray-400 hover:text-orange-500 text-sm transition">
                                Terms of Service
                            </a>
                            <a href="#returns" className="text-gray-400 hover:text-orange-500 text-sm transition">
                                Returns Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;