import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../lib/store';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Search,
  Filter,
  Star,
  Package,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const UserDashboard = () => {
  const { products } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Bottoms', 'Accessories'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MyMerch</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowCart(!showCart)}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 relative transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 relative transition-colors">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-gray-600"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden py-4 border-t border-orange-100">
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 py-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => { setShowCart(true); setShowMenu(false); }}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 py-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cart.length})</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 py-2">
                  <Heart className="w-5 h-5" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 py-2">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-orange-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-orange-600">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-xl shadow-sm border border-orange-50 overflow-hidden hover:shadow-xl hover:shadow-orange-100 transition-all duration-300">
              {/* Product Image */}
              <div className="relative h-48 bg-orange-50">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-orange-200" />
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
                    wishlist.find(item => item.id === product.id)
                      ? 'bg-orange-500 text-white scale-110'
                      : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlist.find(item => item.id === product.id) ? 'fill-white' : ''}`} />
                </button>

                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-3 left-3 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                    Featured
                  </div>
                )}

                {/* Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className={`text-xs font-medium ${
                    product.stock > 10 ? 'text-green-600' : 
                    product.stock > 0 ? 'text-orange-500' : 
                    'text-red-500'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-200'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-orange-300" />
            </div>
            <p className="text-gray-900 text-xl font-semibold">No products found</p>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="p-6 border-b border-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-orange-50 rounded-full text-gray-400 hover:text-orange-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-orange-200" />
                  </div>
                  <p className="text-gray-600 font-medium">Your cart is feeling light!</p>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-orange-600 font-semibold hover:underline"
                  >
                    Start shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0 border border-orange-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-orange-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                        <p className="text-orange-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-orange-100 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-600 font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold w-10 text-center text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 text-xs font-medium uppercase tracking-wider transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-orange-50 bg-orange-50/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-black text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all active:scale-[0.98]">
                  Proceed to Checkout
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 italic">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;