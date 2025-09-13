import React, { useState, useEffect, useRef } from "react";

// If you downloaded images, import them here
import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";

const CarouselItem = ({ images = [], autoPlay = true, interval = 5000 }) => {
    // Use downloaded images if no props passed
    const defaultImages = [
        {
            id: 1,
            src: img1,
            alt: "My First Image",
            title: "Summer Collection Sale",
            subtitle: "Up to 50% off on selected items",
            cta: "Shop Now",
        },
        {
            id: 2,
            src: img2,
            alt: "My Second Image",
            title: "New Arrivals",
            subtitle: "Discover the latest trends",
            cta: "Explore",
        },
        {
            id: 3,
            src: img3,
            alt: "My Third Image",
            title: "Free Shipping",
            subtitle: "On all orders over $50",
            cta: "Learn More",
        },
    ];

    const slides = images.length > 0 ? images : defaultImages;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);

    const startAutoPlay = () => {
        if (autoPlay && slides.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === slides.length - 1 ? 0 : prevIndex + 1
                );
            }, interval);
        }
    };

    const stopAutoPlay = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Auto-play effect
    useEffect(() => {
        startAutoPlay();
        return () => stopAutoPlay();
    }, [autoPlay, interval, slides.length]);

    // Pause on hover
    useEffect(() => {
        if (isHovered) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
        return () => stopAutoPlay();
    }, [isHovered]);

    // Navigation
    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? slides.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div
            className="relative w-full max-w-8xl h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-2xl mb-8 shadow-xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div key={slide.id || index} className="w-full flex-shrink-0 relative">
                        <img
                            src={slide.src}
                            alt={slide.alt}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center items-start p-8 text-white">
                            <div className="max-w-lg ml-4 md:ml-12">
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-5 tracking-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 font-light">
                                    {slide.subtitle}
                                </p>
                                <button className="bg-white text-gray-900 hover:bg-gray-100 font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                                    {slide.cta}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation arrows - Only show on hover */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={goToPrevious}
                    className="bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
                    aria-label="Previous slide"
                >
                    <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <button
                    onClick={goToNext}
                    className="bg-black/40 hover:bg-black/60 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm"
                    aria-label="Next slide"
                >
                    <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>

            {/* Indicators - Modern pill style */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-8 h-1.5 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide counter */}
            <div className="absolute top-6 right-6 bg-black/40 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {slides.length}
            </div>
        </div>
    );
};

export default CarouselItem;