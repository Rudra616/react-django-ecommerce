// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import AppRoutes from './AppRoutes';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <CartProvider>
            <OrderProvider>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main>
                  <AppRoutes />
                </main>
              </div>
            </OrderProvider>
          </CartProvider>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;