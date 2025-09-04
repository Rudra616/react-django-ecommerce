// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { getProducts, searchProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import CategoryList from '../components/CategoryList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState('');
  const productsPerPage = 12;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!hasFetched) {
      fetchProducts();
      setHasFetched(true);
    }
  }, [hasFetched]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const productsData = await getProducts();

      // Handle different API response formats
      let productsArray = [];

      if (Array.isArray(productsData)) {
        productsArray = productsData;
      } else if (productsData && Array.isArray(productsData.results)) {
        productsArray = productsData.results;
      } else if (productsData && typeof productsData === 'object') {
        productsArray = Object.values(productsData);
      } else {
        productsArray = [];
      }

      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, quantity) => {
    if (!user) {
      if (window.confirm('Please login to add items to cart. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }

    addToCart(product, quantity);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        setError('');
        const results = await searchProducts(searchTerm);

        // Handle different API response formats
        let productsArray = [];

        if (Array.isArray(results)) {
          productsArray = results;
        } else if (results && Array.isArray(results.results)) {
          productsArray = results.results;
        } else if (results && typeof results === 'object') {
          productsArray = Object.values(results);
        }

        setProducts(productsArray);
        setSelectedCategory('all');
        setCurrentPage(1);
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.id === selectedCategory ||
        product.category === selectedCategory ||
        product.category_id === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setCurrentPage(1);
    fetchProducts();
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
            <p className="text-gray-600">Discover amazing products at great prices</p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
          >
            Browse Categories
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={fetchProducts}
              className="ml-4 text-red-700 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <CategoryList
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {currentProducts.length} of {filteredProducts.length} products
                {selectedCategory !== 'all' && ' in this category'}
                {searchTerm && ` for "${searchTerm}"`}
              </p>

              {filteredProducts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {currentProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {searchTerm ? 'No products found' : 'No products available'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? `No results found for "${searchTerm}". Try different keywords.`
                        : 'There are no products available at the moment.'
                      }
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {searchTerm ? 'Clear Search' : 'Refresh Products'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                          Previous
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;