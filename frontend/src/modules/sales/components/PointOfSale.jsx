import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  Receipt,
  UtensilsCrossed,
  Store,
  X,
  Check,
  Clock,
  User,
  Phone,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { API_URL } from '@/services/api';
import ReceiptComponent from './Receipt';
import { printThermalReceipt } from '../utils/thermalReceiptPrinter';

const PointOfSale = () => {
  const [cart, setCart] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Customer info
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  
  // Receipt
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  
  // Tax and discount
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Load inventory items, company info, and customers
  useEffect(() => {
    loadInventoryItems();
    loadCompanyInfo();
    loadCustomers();
  }, []);

  const loadInventoryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');
      const response = await fetch(`${API_URL}/inventory/items?status=active&limit=100&company_id=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInventoryItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadCompanyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCompanyInfo(data.data.company || data.data);
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');
      const response = await fetch(`${API_URL}/customers?company_id=${companyId}&limit=500&is_active=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Customers API response:', data);
      if (data.success) {
        const customerList = data.data?.customers || data.data || [];
        console.log('Loaded customers:', customerList.length);
        setCustomers(customerList);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name || customer.company_name || '');
    setShowCustomerDropdown(false);
    // Auto-apply customer discount if available
    const customerDiscount = parseFloat(customer.discount_percentage || customer.discount || 0);
    if (customerDiscount > 0) {
      setDiscountPercentage(customerDiscount);
    }
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setDiscountPercentage(0);
  };

  const filteredCustomers = customers.filter(c => {
    const name = (c.name || c.company_name || '').toLowerCase();
    const phone = (c.phone || c.phone_number || '').toLowerCase();
    const search = customerSearch.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > item.current_stock) {
        alert(`Only ${item.current_stock} units available`);
        return;
      }
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      if (item.current_stock < 1) {
        alert('Item out of stock');
        return;
      }
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: parseFloat(item.selling_price || item.cost_price || 0),
        quantity: 1,
        max_quantity: item.current_stock,
        category: item.category
      }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    const item = cart.find(i => i.id === itemId);
    if (newQuantity > item.max_quantity) {
      alert(`Only ${item.max_quantity} units available`);
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(i => 
      i.id === itemId ? { ...i, quantity: newQuantity } : i
    ));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    clearCustomer();
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const total = taxableAmount + taxAmount;
  const change = paidAmount ? parseFloat(paidAmount) - total : 0;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    // Auto-populate amount with total
    setPaidAmount(total.toString());
    setShowPaymentModal(true);
  };

  const processSale = async () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      alert('Please enter amount received');
      return;
    }
    
    if (paymentMethod === 'cash' && parseFloat(paidAmount) < total) {
      alert('Insufficient payment amount');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const saleData = {
        customer_type: 'supermarket',
        sale_type: 'retail',
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          inventory_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_percentage: 0,
          tax_percentage: taxPercentage
        })),
        discount_percentage: discountPercentage,
        tax_percentage: taxPercentage,
        payment_method: paymentMethod,
        customer_name: selectedCustomer?.name || selectedCustomer?.company_name || customerSearch || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || selectedCustomer?.phone_number || '',
        company_id: localStorage.getItem('company_id')
      };

      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Store completed sale data with cart items
        const saleWithPayment = {
          ...data.data.sale,
          payment_method: paymentMethod,
          paid_amount: parseFloat(paidAmount),
          change_amount: paymentMethod === 'cash' ? change : 0,
          cart_items: [...cart] // Store cart items before clearing
        };
        setCompletedSale(saleWithPayment);
        
        // Close payment modal and show receipt
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        
        // Clear cart and refresh
        clearCart();
        setPaidAmount('');
        loadInventoryItems();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search) ||
                         item.item_code?.toLowerCase().includes(search) ||
                         item.barcode?.toLowerCase().includes(search);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Point of Sale
          </h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Items */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Item Selection */}
          <>
            {/* Search and Categories */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap capitalize ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.current_stock < 1}
                    className={`bg-white rounded-lg border-2 text-left transition-all overflow-hidden ${
                      item.current_stock < 1
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    {/* Product Image */}
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No Image</p>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {item.category}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          ₦
                          {parseFloat(
                            item.selling_price || item.cost_price || 0
                          ).toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-xs ${
                            item.current_stock < 10
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          Stock: {item.current_stock}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        </div>

        {/* Right Side - Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Order</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Customer Selection - Typeahead */}
            <div className="relative">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type customer name or select..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                    // Clear selected customer when typing new value
                    if (selectedCustomer && e.target.value !== (selectedCustomer.name || selectedCustomer.company_name)) {
                      setSelectedCustomer(null);
                      setDiscountPercentage(0);
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  className={`w-full pl-9 pr-8 py-2 border rounded-lg text-sm ${selectedCustomer ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                />
                {customerSearch && (
                  <button 
                    onClick={() => { setCustomerSearch(''); clearCustomer(); }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Typeahead Dropdown */}
              {showCustomerDropdown && !selectedCustomer && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.slice(0, 10).map(customer => (
                      <button
                        key={customer.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full px-3 py-2 text-left hover:bg-primary-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{customer.name || customer.company_name}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{customer.phone || customer.phone_number || 'No phone'}</span>
                          {(customer.discount_percentage || customer.discount) > 0 && (
                            <span className="text-green-600 font-medium">{customer.discount_percentage || customer.discount}% off</span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {customerSearch ? 'No matching customers' : 'No customers found'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Selected Customer Badge */}
              {selectedCustomer && (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-green-600">✓ {selectedCustomer.name || selectedCustomer.company_name}</span>
                  {(selectedCustomer.discount_percentage || selectedCustomer.discount) > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{selectedCustomer.discount_percentage || selectedCustomer.discount}% discount applied</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-3 max-h-96">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Add items to start</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          ₦
                          {item.price.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          each
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="font-bold text-gray-900">
                        ₦
                        {(item.price * item.quantity).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₦
                  {subtotal.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discountPercentage}
                  onChange={(e) =>
                    setDiscountPercentage(parseFloat(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-primary"
                />
              </div>

              {discountPercentage > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount Amount:</span>
                  <span>
                    -₦
                    {discountAmount.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-primary">
                  ₦
                  {total.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Receipt className="h-5 w-5" />
              Checkout - ₦
              {total.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">
                    ₦
                    {total.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "cash", icon: Smartphone, label: "Cash" },
                    { value: "card", icon: CreditCard, label: "Card" }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => {
                        setPaymentMethod(method.value);
                        // Auto-populate amount with total when payment method changes
                        if (!paidAmount) {
                          setPaidAmount(total.toString());
                        }
                      }}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                        paymentMethod === method.value
                          ? "border-primary bg-primary-50"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      <method.icon className="h-5 w-5" />
                      <span className="text-sm">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Received - Always show */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
                {paymentMethod === "cash" &&
                  paidAmount &&
                  parseFloat(paidAmount) > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
                      Change: ₦
                      {change.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaidAmount("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processSale}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-transparent print:relative print:p-0">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
            <div className="p-6 print:p-0">
              <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="text-xl font-bold text-green-600">
                  ✓ Sale Completed!
                </h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Receipt */}
              <div className="mb-4 print:mb-0">
                <ReceiptComponent
                  sale={completedSale}
                  items={completedSale.cart_items || []}
                  subtotal={parseFloat(completedSale.subtotal || 0)}
                  discount={parseFloat(completedSale.discount_amount || 0)}
                  tax={parseFloat(completedSale.tax_amount || 0)}
                  total={parseFloat(completedSale.total_amount || 0)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => {
                    const receiptData = {
                      companyName: companyInfo?.name || 'YOUR COMPANY NAME',
                      address: companyInfo?.address || '123 Business Avenue',
                      phone: companyInfo?.phone || '+234 800 123 4567',
                      date: new Date(completedSale.sale_date).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }),
                      receiptNo: completedSale.sale_number,
                      items: completedSale.cart_items || [],
                      subtotal: parseFloat(completedSale.subtotal || 0),
                      discount: parseFloat(completedSale.discount_amount || 0),
                      tax: parseFloat(completedSale.tax_amount || 0),
                      total: parseFloat(completedSale.total_amount || 0),
                      customerName: completedSale.customer_name
                    };
                    printThermalReceipt(receiptData);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;
