// components/Navbar.jsx
import React, { useState } from "react";
import { ImCart } from "react-icons/im";
import { SiShopify } from "react-icons/si";
import { FaUserCircle, FaBars, FaTimes, FaInfoCircle, FaCogs, FaEnvelope } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ setSection, onSearch, onCartClick, currentSection }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { isLoggedIn, logout } = useAuth();

    const handleSearchClick = () => {
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery);
            setSearchQuery("");
            setMobileMenuOpen(false);
        }
    };

    const handleProfileClick = () => {
        setSection("profile");
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setSection("home");
        setMobileMenuOpen(false);
    };
    const handleNavigation = (section) => {
        console.log("Navigating to:", section); // Debug log
        setSection(section);
        setMobileMenuOpen(false);

        // If going to orders, make sure user is logged in
        if (section === 'orders' && !isLoggedIn) {
            console.log("User not logged in, redirecting to login"); // Debug log
            setSection('login');
        }
    };
    const isActive = (sectionName) => {
        return currentSection === sectionName ? "text-orange-600 font-bold" : "text-gray-700 hover:text-orange-500";
    };

    return (
        <header className="w-full shadow-md bg-white sticky top-0 z-50">
            {/* Main Navigation Bar */}
            <div className="border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <button
                            className="flex items-center font-bold leading-none shrink-0"
                            onClick={() => handleNavigation("home")}
                        >
                            <span className="text-2xl md:text-3xl">s</span>
                            <span className="text-3xl md:text-4xl text-orange-500">To</span>
                            <span className="text-2xl md:text-3xl">Re</span>
                        </button>

                        {/* Desktop Navigation - Hidden on mobile */}
                        <nav className="hidden lg:flex items-center gap-x-8 text-lg">
                            <button
                                onClick={() => handleNavigation("home")}
                                className={`font-semibold tracking-wide transition ${isActive("home")}`}
                            >
                                Home
                            </button>
                            <button
                                onClick={() => handleNavigation("about")}
                                className={`font-semibold tracking-wide transition ${isActive("about")}`}
                            >
                                About Us
                            </button>
                            <button
                                onClick={() => handleNavigation("process")}
                                className={`font-semibold tracking-wide transition ${isActive("process")}`}
                            >
                                Process
                            </button>
                            <button
                                onClick={() => handleNavigation("contact")}
                                className={`font-semibold tracking-wide transition ${isActive("contact")}`}
                            >
                                Contact Us
                            </button>
                        </nav>

                        {/* Desktop Search & Icons - Hidden on mobile */}
                        <div className="hidden lg:flex items-center gap-6">
                            {/* Search Bar */}
                            <div className="flex border-2 border-orange-500 rounded-full overflow-hidden w-80">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                                    className="px-4 py-2 flex-1 focus:outline-none text-gray-700 text-sm"
                                />
                                <button
                                    onClick={handleSearchClick}
                                    className="bg-orange-500 text-white px-4 flex items-center justify-center hover:bg-orange-600 transition"
                                >
                                    <IoSearch className="text-lg" />
                                </button>
                            </div>

                            {/* Icons */}
                            <div className="flex items-center gap-4">
                                <button
                                    className="p-2 text-gray-700 hover:text-orange-500 transition relative"
                                    onClick={onCartClick}
                                    title="Cart"
                                >
                                    <ImCart className="text-xl" />
                                </button>

                                <button
                                    className="p-2 text-gray-700 hover:text-orange-500 transition"
                                    title="Shop"
                                    onClick={() => handleNavigation("orders")}
                                >
                                    <SiShopify className="text-xl" />
                                </button>
                                {isLoggedIn ? (
                                    <>
                                        <button
                                            className="p-2 text-gray-700 hover:text-orange-500 transition"
                                            title="Profile"
                                            onClick={handleProfileClick} // Add this

                                        >
                                            <FaUserCircle className="text-xl" />
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 text-gray-700 hover:text-orange-500 text-sm font-medium border border-gray-300 rounded-lg hover:border-orange-300 transition"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleNavigation("login")}
                                            className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:border-orange-300 transition"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => handleNavigation("register")}
                                            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
                                        >
                                            Register
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-orange-500 transition"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar - Always visible on mobile */}
            <div className="lg:hidden border-b border-gray-200 bg-gray-50">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex border-2 border-orange-500 rounded-full overflow-hidden">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
                                placeholder="Search products..."
                                className="px-4 py-2 flex-1 focus:outline-none text-sm bg-white"
                            />
                            <button
                                onClick={handleSearchClick}
                                className="bg-orange-500 text-white px-4 flex items-center justify-center hover:bg-orange-600 transition"
                            >
                                <IoSearch className="text-lg" />
                            </button>
                        </div>
                        <button
                            className="p-2 text-gray-700 hover:text-orange-500 transition"
                            onClick={onCartClick}
                            title="Cart"
                        >
                            <ImCart className="text-xl" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
                        {/* Navigation Links */}
                        <nav className="space-y-2">
                            <button
                                onClick={() => handleNavigation("home")}
                                className={`w-full text-left py-3 px-4 rounded-lg transition flex items-center gap-3 ${isActive("home")}`}
                            >
                                <span className="w-6 text-center">🏠</span>
                                Home
                            </button>

                            <button
                                onClick={() => handleNavigation("about")}
                                className={`w-full text-left py-3 px-4 rounded-lg transition flex items-center gap-3 ${isActive("about")}`}
                            >
                                <FaInfoCircle className="w-5 h-5" />
                                About Us
                            </button>

                            <button
                                onClick={() => handleNavigation("process")}
                                className={`w-full text-left py-3 px-4 rounded-lg transition flex items-center gap-3 ${isActive("process")}`}
                            >
                                <FaCogs className="w-5 h-5" />
                                Process
                            </button>

                            <button
                                onClick={() => handleNavigation("contact")}
                                className={`w-full text-left py-3 px-4 rounded-lg transition flex items-center gap-3 ${isActive("contact")}`}
                            >
                                <FaEnvelope className="w-5 h-5" />
                                Contact Us
                            </button>
                        </nav>

                        {/* Auth Section */}
                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <div className="flex justify-center gap-4 mb-4">
                                <button className="p-3 text-gray-700 hover:text-orange-500 transition" onClick={() => handleNavigation("orders")}>
                                    <SiShopify className="text-xl" />
                                </button>
                                {isLoggedIn && (
                                    <button className="p-3 text-gray-700 hover:text-orange-500 transition" onClick={handleProfileClick} >
                                        <FaUserCircle className="text-xl" />
                                    </button>
                                )}
                            </div>

                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 px-4 text-red-600 hover:text-red-800 font-medium rounded-lg border border-red-200 hover:border-red-300 transition text-center"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation("login")}
                                    className="w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition text-center"
                                >
                                    Login / Register
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;