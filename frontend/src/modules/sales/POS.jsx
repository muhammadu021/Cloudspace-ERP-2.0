import React, { useState } from 'react';
import { Card, Button, Badge } from '../../design-system/components';

export const POS = () => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');

  const products = [
    { id: 1, name: 'Product A', price: 29.99, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 49.99, category: 'Electronics' },
    { id: 3, name: 'Product C', price: 19.99, category: 'Accessories' },
    { id: 4, name: 'Product D', price: 39.99, category: 'Accessories' }
  ];

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="grid grid-cols-3 gap-6 h-screen">
      {/* Products */}
      <div className="col-span-2 space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md" onClick={() => addToCart(product)}>
              <div className="p-4">
                <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">{product.category}</div>
                <div className="text-lg font-bold text-gray-900 mt-2">${product.price}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white border-l border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cart</h2>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
              </div>
              <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg">Checkout</Button>
        </div>
      </div>
    </div>
  );
};
