import React, { useEffect, useState } from "react";
import { getCategories, getproducts, getProductsByCategory } from "../apis";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import CategoryProducts from "../components/CategoryProducts";
import ProductDetail from "../components/ProductDetail";
import CarouselItem from "../components/CarouselItem";

const Home = ({ onProductClick, onAddToCart, cartItems }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
    const [error, setError] = useState("");

    const [searchResults, setSearchResults] = useState([]);
    const [section, setSection] = useState("home");

    useEffect(() => {
        const fetchData = async () => {
            setLoadingCategories(true);
            setLoadingProducts(true);
            try {
                const [catRes, prodRes] = await Promise.all([getCategories(), getproducts()]);
                if (catRes.success) setCategories(catRes.categories);
                if (prodRes.success) setProducts(prodRes.products);
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoadingCategories(false);
                setLoadingProducts(false);
            }
        };
        fetchData();
    }, []);

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setSelectedProduct(null);
        setError("");
        setLoadingCategoryProducts(true);
        try {
            const res = await getProductsByCategory(category.id);
            if (res.success) {
                setCategoryProducts(res.products);
            } else {
                setError("Failed to load category products");
            }
        } catch (err) {
            setError("Network error loading category products");
        } finally {
            setLoadingCategoryProducts(false);
        }
    };

    const handleBackFromCategory = () => {
        setSelectedCategory(null);
        setCategoryProducts([]);
        setError("");
    };

    const handleBackFromProduct = () => {
        setSelectedProduct(null);
        setError("");
    };

    // Show error message if there's an error
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="max-w-[1400px] w-full mx-auto px-6 py-12">



                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                        <button
                            onClick={() => setError("")}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Try Again
                        </button>
                        {error.includes("login") && (
                            <button
                                onClick={() => window.location.href = "/login"}
                                className="mt-2 ml-4 px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (section === "searchResults") {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-[1400px] w-full mx-auto px-6 py-12">
                    <h2 className="text-3xl font-bold mb-4">Search Results</h2>
                    <ProductList products={products} onProductClick={onProductClick} loading={loadingProducts} />
                    <button
                        onClick={() => setSection("home")}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <CarouselItem

                />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-gray-800">
                    Welcome to <span className="text-2xl md:text-5xl">s</span>
                    <span className="text-3xl md:text-6xl text-orange-500">To</span>
                    <span className="text-2xl md:text-5xl">Re</span>
                </h1>

                {!selectedCategory && (
                    <>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-2 sm:px-0">Shop by Category</h2>
                        <CategoryList categories={categories} onCategoryClick={handleCategoryClick} loading={loadingCategories} />

                        <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-2 sm:px-0 mt-8">All Products</h2>
                        {/* ✅ Use onProductClick from props (App.jsx) */}
                        <ProductList products={products} onProductClick={onProductClick} loading={loadingProducts} />
                    </>
                )}

                {selectedCategory && (
                    <CategoryProducts
                        category={selectedCategory}
                        products={categoryProducts}
                        onBack={handleBackFromCategory}
                        onProductClick={onProductClick}  // ✅ still using prop
                        loading={loadingCategoryProducts}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
