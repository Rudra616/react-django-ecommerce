// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'; // ✅ Add useEffect import
import { getOrders } from "../api/orderApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth(); // ✅ Get auth state



    useEffect(() => {
        // Only fetch orders if user is authenticated
        if (user) {
            fetchOrders();
        } else {
            // Clear orders if user logs out
            setOrders([]);
        }
    }, [user]); // ✅ Add user as dependency


    const fetchOrders = async () => {
        // Don't fetch if no user
        if (!user) {
            setOrders([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const ordersData = await getOrders();
            setOrders(ordersData.results || ordersData || []);
        } catch (err) {
            setError(err);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderContext.Provider value={{ orders, fetchOrders, loading, error }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => useContext(OrderContext);