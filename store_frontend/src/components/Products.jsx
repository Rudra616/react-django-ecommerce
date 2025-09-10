// import React, { useState, useEffect } from 'react'
// import { getProductDetail, getproducts } from '../apis'

// const Products = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState("")
//     const [productdetail, setProductdetail] = useState(null); // ✅ make it null initially
//     const [loadingproductdetails, setLoadingproductdetails] = useState(false)

//     const fetchProducts = async () => {
//         setLoading(true)
//         setError("")
//         try {
//             const res = await getproducts()
//             if (res.success && Array.isArray(res.products)) {
//                 setProducts(res.products)
//             } else {
//                 setError("No products found")
//             }
//         } catch (err) {
//             setError("Failed to fetch products");
//         } finally {
//             setLoading(false);
//         }
//     }

//     const handleProductClick = async (product) => {
//         setLoadingproductdetails(true)
//         setProductdetail(null)
//         try {
//             const res = await getProductDetail(product.id)
//             console.log(res)
//             if (res.success) {
//                 setProductdetail(res.productdetial)
//             } else {
//                 setProductdetail(null)
//             }
//         } catch (err) {
//             console.log(err)
//             setProductdetail(null)
//         } finally {
//             setLoadingproductdetails(false)
//         }
//     }

//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     return (
//         <div className="p-6">
//             <h2 className="text-2xl font-bold text-center mb-6">Products</h2>

//             {loading ? (
//                 <p className="text-center text-gray-600">Loading products...</p>
//             ) : error ? (
//                 <p className="text-center text-red-500">{error}</p>
//             ) : (
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     {products.map((product) => (
//                         <div
//                             key={product.id}
//                             className="bg-white p-4 rounded shadow text-center cursor-pointer hover:shadow-lg transition"
//                             onClick={() => handleProductClick(product)}
//                         >
//                             <img
//                                 src={product.image}
//                                 alt={product.name}
//                                 className="mx-auto mb-2 h-24 w-24 object-cover rounded-full"
//                             />
//                             <h3 className="font-semibold text-lg">{product.name}</h3>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* ✅ Show Product Detail Modal/Section */}
//             {loadingproductdetails && <p className="mt-6 text-center text-gray-500">Loading details...</p>}

//             {productdetail && (
//                 <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
//                     <h3 className="text-xl font-bold mb-2">{productdetail.name}</h3>
//                     <img
//                         src={productdetail.image}
//                         alt={productdetail.name}
//                         className="mx-auto mb-4 h-48 w-48 object-cover rounded-lg"
//                     />
//                     <p className="text-gray-700 mb-2">{productdetail.description}</p>
//                     <p className="text-lg font-semibold">Price: ₹{productdetail.price}</p>
//                     <p className="text-sm text-gray-500">Stock: {productdetail.stock}</p>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default Products
