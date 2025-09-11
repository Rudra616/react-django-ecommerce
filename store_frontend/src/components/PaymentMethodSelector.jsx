// components/PaymentMethodSelector.jsx
import React from 'react';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }) => {
    const methods = [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'cod', name: 'Cash on Delivery', icon: '💰' }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="space-y-3">
                {methods.map((method) => (
                    <label key={method.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => onMethodChange(e.target.value)}
                            className="mr-3"
                        />
                        <span className="text-xl mr-2">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;