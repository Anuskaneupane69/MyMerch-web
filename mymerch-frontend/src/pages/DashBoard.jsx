import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, ShoppingCart, Heart, Search, Filter, 
  Star, Package, User, LogOut, Menu, X, Loader2 
} from 'lucide-react';
import { getProductsApi } from '../services/api';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Bottoms', 'Accessories'];

  // 1. FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getProductsApi();
        // Assuming API returns { data: [...] } or just [...]
        const data = response.data || response;
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. FALLBACK IMAGE LOGIC
  const getProductImage = (product) => {
    if (product.image && product.image.trim() !== "") return product.image;
    
    // Static fallbacks based on category
    const fallbacks = {
      'T-Shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500',
      'Hoodies': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=500',
      'Bottoms': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
      'Accessories': 'https://images.unsplash.com/photo-1544816153-12ad5d714b21?auto=format&fit=crop&q=80&w=500',
      'default': 'https://images.unsplash.com/photo-1583333222044-2e3a70d8f219?auto=format&fit=crop&q=80&w=500'
    };
    return fallbacks[product.category] || fallbacks['default'];
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // 3. ACTIONS
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => 
      prev.find(item => item.id === product.id)
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <div className="min-h-screen bg-orange-50/30 font-sans">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MyMerch</span>
          </Link>

          <div className="flex items-center gap-6">
            <button onClick={() => setShowCart(true)} className="relative group p-2">
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
            <button className="relative p-2">
              <Heart className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-gray-500 font-medium">Fetching the latest merch...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${wishlist.some(i => i.id === product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
                  >
                    <Heart className="w-4 h-4" fill={wishlist.some(i => i.id === product.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500">{product.category}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                    <button 
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-200 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setShowCart(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-orange-50 pb-4">
                    <img src={getProductImage(item)} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-orange-600 font-bold text-sm">${parseFloat(item.price).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 border rounded">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 border rounded">+</button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-xs font-bold uppercase">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-6 border-t border-orange-100">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg">
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;