import React, { useState } from "react";
import { ImCart } from "react-icons/im";
import { SiShopify } from "react-icons/si";
import { FaUserCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";

const Navbar = ({ setSection }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem("accessToken");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setSection("home");
        setMobileMenuOpen(false);
    };

    return (
        <header className="w-full shadow-md bg-white">
            <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4 relative">
                {/* Logo */}
                <button
                    className="flex items-center font-bold leading-none"
                    onClick={() => { setSection("home"); setMobileMenuOpen(false); }}
                >
                    <span className="text-4xl">s</span>
                    <span className="text-5xl text-orange-500">To</span>
                    <span className="text-4xl">Re</span>
                </button>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-x-10 text-xl">
                    <button onClick={() => setSection("home")} className="font-semibold tracking-wider text-orange-500 hover:text-orange-600 transition">
                        Home
                    </button>
                    <button className="font-semibold tracking-wider text-gray-700 hover:text-orange-500 transition">About Us</button>
                    <button className="font-semibold tracking-wider text-gray-700 hover:text-orange-500 transition">Process</button>
                    <button className="font-semibold tracking-wider text-gray-700 hover:text-orange-500 transition">Contact Us</button>
                </div>

                {/* Desktop Search & Icons */}
                <div className="hidden lg:flex items-center gap-x-4 text-xl">
                    <div className="flex border-2 border-orange-500 rounded-full overflow-hidden">
                        <input type="text" placeholder="Search..." className="px-4 py-2 focus:outline-none text-gray-700" />
                        <button className="bg-orange-500 text-white px-4 flex items-center justify-center">
                            <IoSearch className="text-xl" />
                        </button>
                    </div>

                    <button className="text-2xl text-zinc-800"><ImCart /></button>
                    <button className="text-2xl text-zinc-800"><SiShopify /></button>

                    {isLoggedIn ? (
                        <>
                            <button className="text-2xl text-zinc-800"><FaUserCircle /></button>
                            <button onClick={handleLogout} className="font-semibold tracking-wider text-gray-700 hover:text-orange-500 transition">Logout</button>
                        </>
                    ) : (
                        <button onClick={() => setSection("login")} className="font-semibold tracking-wider text-gray-700 hover:text-orange-500 transition">Login</button>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button className="lg:hidden text-3xl text-gray-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    ☰
                </button>

                {/* Mobile Menu Buttons */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 z-50">
                        <div className="flex flex-col gap-4 px-6 py-4">
                            <button onClick={() => { setSection("home"); setMobileMenuOpen(false); }} className="text-gray-700 font-semibold hover:text-orange-500 text-left">Home</button>
                            <button className="text-gray-700 font-semibold hover:text-orange-500 text-left">About Us</button>
                            <button className="text-gray-700 font-semibold hover:text-orange-500 text-left">Process</button>
                            <button className="text-gray-700 font-semibold hover:text-orange-500 text-left">Contact Us</button>
                            {isLoggedIn ? (
                                <button onClick={handleLogout} className="text-red-500 font-semibold hover:underline text-left">Logout</button>
                            ) : (
                                <button onClick={() => { setSection("login"); setMobileMenuOpen(false); }} className="text-gray-700 font-semibold hover:text-orange-500 text-left">Login</button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Search Bar - Always Visible */}
            <div className="lg:hidden w-full bg-white shadow-md border-t border-gray-200 px-6 py-4">
                <div className="flex border-2 border-orange-500 rounded-full overflow-hidden">
                    <input type="text" placeholder="Search..." className="px-4 py-2 flex-1 focus:outline-none" />
                    <button className="bg-orange-500 text-white px-4 flex items-center justify-center">
                        <IoSearch className="text-xl" />
                    </button>
                </div>
            </div>
        </header>

    );
};

export default Navbar;
