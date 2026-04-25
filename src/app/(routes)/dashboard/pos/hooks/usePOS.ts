import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductService from '../../products/services/productService';
import CategoryService from '../../products/categories/services/categoryService';
import { CustomerService } from '../../customers/services/customerService';
import { Product } from '../../products/types';
import {
  CartItem,
  POSCategory,
  POSCustomer,
  PaymentMethod,
  OrderSummary
} from '../types';

const TAX_RATE = 0.15; // 15% VAT

export function usePOS() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<POSCategory[]>([]);
  const [customers, setCustomers] = useState<POSCustomer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Loading and error states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      const { products: fetchedProducts } = await ProductService.getProducts({
        status: 'active',
        limit: 100
      });
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const { categories: fetchedCategories } = await CategoryService.getCategories({
        status: 'active'
      });
      const posCategories: POSCategory[] = [
        { id: 'all', name: 'All Products' },
        ...fetchedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          productsCount: cat.productsCount
        }))
      ];
      setCategories(posCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories if fetch fails
      setCategories([{ id: 'all', name: 'All Products' }]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoadingCustomers(true);
      const { customers: fetchedCustomers } = await CustomerService.getAllCustomers({
        status: 'active',
        limit: 100
      });
      const posCustomers: POSCustomer[] = fetchedCustomers.map(cust => ({
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        type: cust.type
      }));
      setCustomers(posCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  // Search customers
  const searchCustomers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      fetchCustomers();
      return;
    }
    try {
      const { customers: results } = await CustomerService.searchCustomers(query, {
        status: 'active',
        limit: 20
      });
      const posCustomers: POSCustomer[] = results.map(cust => ({
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        type: cust.type
      }));
      setCustomers(posCustomers);
    } catch (err) {
      console.error('Error searching customers:', err);
    }
  }, [fetchCustomers]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, [fetchProducts, fetchCategories, fetchCustomers]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category?.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        // Check stock
        if (existing.quantity >= product.stock) {
          return prev; // Don't add more than available stock
        }
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price * (1 - item.discount / 100)
              }
            : item
        );
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        taxRate: product.taxRate || TAX_RATE * 100,
        discount: 0,
        total: product.price
      };

      return [...prev, newItem];
    });
  }, []);

  // Update cart item quantity
  const updateCartQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.quantity + delta);
          if (newQty === 0) return item; // Will be filtered out
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price * (1 - item.discount / 100)
          };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  // Set cart item quantity directly
  const setCartQuantity = useCallback((itemId: string, quantity: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(0, quantity);
          if (newQty === 0) return item;
          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price * (1 - item.discount / 100)
          };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  // Apply discount to cart item
  const applyItemDiscount = useCallback((itemId: string, discount: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const discountValue = Math.min(100, Math.max(0, discount));
          return {
            ...item,
            discount: discountValue,
            total: item.quantity * item.price * (1 - discountValue / 100)
          };
        }
        return item;
      });
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountPercent(0);
  }, []);

  // Calculate order summary
  const orderSummary = useMemo((): OrderSummary => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * TAX_RATE;
    const total = taxableAmount + taxAmount;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      total,
      itemCount
    };
  }, [cart, discountPercent]);

  // Hold order (save for later)
  const holdOrder = useCallback(() => {
    const heldOrders = JSON.parse(localStorage.getItem('pos_held_orders') || '[]');
    const order = {
      id: `hold-${Date.now()}`,
      cart,
      customer: selectedCustomer,
      discountPercent,
      createdAt: new Date().toISOString()
    };
    heldOrders.push(order);
    localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
    clearCart();
    return order.id;
  }, [cart, selectedCustomer, discountPercent, clearCart]);

  // Recall held order
  const recallOrder = useCallback((orderId: string) => {
    const heldOrders = JSON.parse(localStorage.getItem('pos_held_orders') || '[]');
    const order = heldOrders.find((o: { id: string }) => o.id === orderId);
    if (order) {
      setCart(order.cart);
      setSelectedCustomer(order.customer);
      setDiscountPercent(order.discountPercent);
      // Remove from held orders
      const updatedOrders = heldOrders.filter((o: { id: string }) => o.id !== orderId);
      localStorage.setItem('pos_held_orders', JSON.stringify(updatedOrders));
    }
  }, []);

  // Get held orders
  const getHeldOrders = useCallback(() => {
    return JSON.parse(localStorage.getItem('pos_held_orders') || '[]');
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, [fetchProducts, fetchCategories, fetchCustomers]);

  return {
    // Data
    products: filteredProducts,
    allProducts: products,
    categories,
    customers,
    cart,
    selectedCustomer,
    selectedCategory,
    searchTerm,
    discountPercent,
    paymentMethod,
    orderSummary,

    // Loading states
    isLoading: isLoadingProducts || isLoadingCategories,
    isLoadingProducts,
    isLoadingCategories,
    isLoadingCustomers,
    error,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    setSelectedCustomer,
    setDiscountPercent,
    setPaymentMethod,
    addToCart,
    updateCartQuantity,
    setCartQuantity,
    applyItemDiscount,
    removeFromCart,
    clearCart,
    searchCustomers,
    holdOrder,
    recallOrder,
    getHeldOrders,
    refreshData
  };
}
