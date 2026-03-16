import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, ShoppingCart, Heart, Search,
  Star, X, Loader2, MessageSquare, Trash2, Send, ShieldAlert, CheckCircle2, Package, LogOut
} from 'lucide-react';
import { 
  addReviewApi, deleteReviewApi, getProductsApi, getReviewsByProductApi,
  createOrderApi, deleteOrderApi, getUserOrdersApi,
  getWishlistApi, toggleWishlistApi
} from '../services/api';

const UserDashboard = () => {
  const [products, setProducts]               = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart]                       = useState([]);
  const [wishlist, setWishlist]               = useState([]);
  const [showCart, setShowCart]               = useState(false);
  const [showOrders, setShowOrders]           = useState(false);
  const [showWishlist, setShowWishlist]       = useState(false);
  const [userOrders, setUserOrders]           = useState([]);
  const [checkingOut, setCheckingOut]         = useState(false);
  const [checkoutError, setCheckoutError]     = useState('');
  const [reviewModal, setReviewModal]         = useState(null);
  const [reviews, setReviews]                 = useState([]);
  const [reviewsLoading, setReviewsLoading]   = useState(false);
  const [newReview, setNewReview]             = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]           = useState(false);
  const [reviewError, setReviewError]         = useState('');
  const [hasBought, setHasBought]             = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Bottoms', 'Accessories'];

  const [currentUser] = useState(() => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/';
  };

  // ── Fetch products ────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await getProductsApi();
        const data = res.data || res;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch products:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Fetch orders ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchOrders = async () => {
      try {
        const res = await getUserOrdersApi();
        const data = res.data || res;
        setUserOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // ── Fetch wishlist ────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchWishlist = async () => {
      try {
        const res = await getWishlistApi();
        const data = res.data || res;
        setWishlist(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch wishlist:', e);
      }
    };
    fetchWishlist();
  }, [currentUser]);

  // ── Fetch reviews when modal opens ────────────────────────
  useEffect(() => {
    if (!reviewModal) return;
    setReviews([]);
    setReviewError('');
    setNewReview({ rating: 5, comment: '' });
    setHasBought(false);
    setHasAlreadyReviewed(false);

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await getReviewsByProductApi(reviewModal.id);
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setReviews(data);
        if (currentUser) {
          setHasAlreadyReviewed(!!data.find(r => Number(r.userId) === Number(currentUser.id)));
          setHasBought(userOrders.some(o => Number(o.productId) === Number(reviewModal.id)));
        }
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [reviewModal, userOrders]);

  // ── Helpers ───────────────────────────────────────────────
  const getProductImage = (product) => {
    if (product?.image && product.image.trim() !== '') return `${import.meta.env.VITE_API_BASE_URL}/${product.image}`;
    const fallbacks = {
      'T-Shirts':    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500',
      'Hoodies':     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=500',
      'Bottoms':     'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=500',
      'Accessories': 'https://images.unsplash.com/photo-1544816153-12ad5d714b21?auto=format&fit=crop&q=80&w=500',
      'default':     'https://images.unsplash.com/photo-1583333222044-2e3a70d8f219?auto=format&fit=crop&q=80&w=500',
    };
    return fallbacks[product?.category] || fallbacks['default'];
  };

  const renderStars = (rating, interactive = false, onSelect = null) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" disabled={!interactive}
          onClick={() => interactive && onSelect(star)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}>
          <Star className="w-4 h-4"
            fill={star <= rating ? '#f97316' : 'none'}
            stroke={star <= rating ? '#f97316' : '#d1d5db'} />
        </button>
      ))}
    </div>
  );

  const reviewFormStatus = () => {
    if (!currentUser)       return { type: 'warn', msg: 'Log in to leave a review.' };
    if (!hasBought)         return { type: 'warn', msg: 'Only verified buyers can write a review.' };
    if (hasAlreadyReviewed) return { type: 'info', msg: 'You have already reviewed this product.' };
    return null;
  };

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  }), [products, searchQuery, selectedCategory]);

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  // ── Cart ──────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const updateQuantity = (id, change) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + change) } : i));

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // ── Wishlist ──────────────────────────────────────────────
  const toggleWishlist = async (product) => {
    if (!currentUser) return;
    try {
      await toggleWishlistApi(product.id);
      setWishlist(prev => {
        const exists = prev.find(i => Number(i.productId) === Number(product.id));
        if (exists) return prev.filter(i => Number(i.productId) !== Number(product.id));
        return [...prev, { productId: product.id, product }];
      });
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
    }
  };

  // ── Checkout ──────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!currentUser) return setCheckoutError('You must be logged in to checkout.');
    try {
      setCheckingOut(true);
      setCheckoutError('');
      const results = await Promise.allSettled(
        cart.map(item => createOrderApi({ productId: item.id, quantity: item.quantity }))
      );
      const succeeded = [];
      const failed    = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') succeeded.push(r.value.data || r.value);
        else failed.push(cart[i].name);
      });
      if (succeeded.length) {
        setUserOrders(prev => [...succeeded, ...prev]);
        const successIds = succeeded.map(o => o.productId);
        setCart(prev => prev.filter(i => !successIds.includes(i.id)));
      }
      if (failed.length) setCheckoutError(`Could not order: ${failed.join(', ')}. Check stock.`);
      else {
        setShowCart(false);
        setShowOrders(true);
        alert('✅ Order placed! Please contact 9822504080 to receive your order.');
      }
    } catch (e) {
      setCheckoutError(e?.response?.data?.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  // ── Cancel order ──────────────────────────────────────────
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await deleteOrderApi(orderId);
      setUserOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error('Failed to cancel order:', e);
    }
  };

  // ── Reviews ───────────────────────────────────────────────
  const handleAddReview = async () => {
    if (!currentUser)       return setReviewError('You must be logged in to leave a review.');
    if (!hasBought)         return setReviewError('You can only review products you have purchased.');
    if (hasAlreadyReviewed) return setReviewError('You have already reviewed this product.');
    try {
      setSubmitting(true);
      setReviewError('');
      const res = await addReviewApi(reviewModal.id, { rating: newReview.rating, comment: newReview.comment });
      setReviews(prev => [res.data || res, ...prev]);
      setHasAlreadyReviewed(true);
      setNewReview({ rating: 5, comment: '' });
    } catch (e) {
      setReviewError(e?.response?.data?.message || 'Failed to post review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReviewApi(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setHasAlreadyReviewed(false);
    } catch (e) {
      setReviewError(e?.response?.data?.message || 'Failed to delete review.');
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-orange-50/30 font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MyMerch</span>
          </Link>
          <div className="flex items-center gap-4">
            {currentUser && (
              <button onClick={() => setShowOrders(true)} className="relative group p-2" title="My Orders">
                <Package className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
                {userOrders.length > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {userOrders.length}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setShowCart(true)} className="relative group p-2">
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
            <button onClick={() => setShowWishlist(true)} className="relative group p-2">
              <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select className="px-4 py-3 bg-white border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
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
            {filteredProducts.map(product => {
              const isPurchased = userOrders.some(o => Number(o.productId) === Number(product.id));
              const inWishlist  = wishlist.some(i => Number(i.productId) === Number(product.id));
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    <img src={getProductImage(product)} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {isPurchased && (
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Purchased
                      </span>
                    )}
                    <button onClick={() => toggleWishlist(product)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}>
                      <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500">{product.category}</span>
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setReviewModal(product)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors" title="Reviews">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button disabled={product.stock === 0} onClick={() => addToCart(product)}
                          className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-200 transition-colors">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Cart Sidebar ── */}
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
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-orange-50 pb-4">
                  <img src={getProductImage(item)} className="w-20 h-20 rounded-lg object-cover" alt={item.name} />
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
              ))}
            </div>
            {cart.length > 0 && (
              <div className="pt-6 border-t border-orange-100">
                {checkoutError && <p className="text-xs text-red-500 font-medium mb-3">{checkoutError}</p>}
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={handleCheckout} disabled={checkingOut}
                  className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                  {checkingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Checkout Now'}
                </button>
                <div className="mt-4 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-sm">📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">For order inquiries, call us:</p>
                    <p className="text-sm font-bold text-gray-900">9822504080</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Wishlist Sidebar ── */}
      {showWishlist && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWishlist(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Wishlist</h2>
              <button onClick={() => setShowWishlist(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No items in your wishlist.</p>
                </div>
              ) : wishlist.map(item => (
                <div key={item.productId} className="flex gap-4 border border-orange-100 rounded-xl p-4">
                  <img src={getProductImage(item.product)} className="w-16 h-16 rounded-lg object-cover shrink-0" alt={item.product?.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900">{item.product?.name}</h4>
                    <p className="text-orange-600 font-bold text-sm">${parseFloat(item.product?.price || 0).toFixed(2)}</p>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{item.product?.category}</span>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      disabled={item.product?.stock === 0}
                      onClick={() => { addToCart(item.product); }}
                      className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-200 transition-colors"
                      title="Add to cart">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(item.product)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove from wishlist">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Orders Sidebar ── */}
      {showOrders && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOrders(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">My Orders</h2>
              <button onClick={() => setShowOrders(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {userOrders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet.</p>
                </div>
              ) : userOrders.map(order => (
                <div key={order.id} className="flex gap-4 border border-orange-100 rounded-xl p-4">
                  <img src={getProductImage(order.product)} className="w-16 h-16 rounded-lg object-cover shrink-0" alt={order.product?.name} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900">{order.product?.name || 'Product'}</h4>
                    <p className="text-orange-600 font-bold text-sm">${parseFloat(order.product?.price || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(order.purchasedAt || order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => handleCancelOrder(order.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors self-start shrink-0" title="Cancel order">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-orange-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                <p className="text-sm text-orange-500 font-medium">{reviewModal.name}</p>
              </div>
              <button onClick={() => setReviewModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-orange-50 bg-orange-50/40">
              {(() => {
                const status = reviewFormStatus();
                if (status) return (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    status.type === 'warn'
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}>
                    {status.type === 'warn'
                      ? <ShieldAlert className="w-4 h-4 shrink-0" />
                      : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {status.msg}
                  </div>
                );
                return (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-700">Write a Review</h3>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-100 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {currentUser?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{currentUser?.username}</span>
                      <span className="ml-auto text-[10px] bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">Verified Buyer</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">Rating:</span>
                      {renderStars(newReview.rating, true, star => setNewReview(prev => ({ ...prev, rating: star })))}
                      <span className="text-sm font-bold text-orange-500">{newReview.rating}/5</span>
                    </div>
                    <textarea placeholder="Share your thoughts... (optional)" rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                      value={newReview.comment}
                      onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))} />
                    {reviewError && <p className="text-xs text-red-500 font-medium">{reviewError}</p>}
                    <button onClick={handleAddReview} disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors ml-auto">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : reviews.map(review => {
                const isOwner = currentUser && Number(review.userId) === Number(currentUser.id);
                return (
                  <div key={review.id} className={`flex gap-3 p-4 rounded-xl ${isOwner ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'}`}>
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                      {review.author?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{review.author}</span>
                          {isOwner && <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">You</span>}
                        </div>
                        {isOwner && (
                          <button onClick={() => handleDeleteReview(review.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {renderStars(review.rating)}
                      {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;