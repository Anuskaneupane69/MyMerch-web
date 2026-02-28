import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Package,
  ArrowLeft,
  Star,
  X,
  Loader2,
} from 'lucide-react';
import { 
  getProductsApi, 
  addProductApi, 
  updateProductApi, 
  deleteProductApi 
} from '../../services/api';

const categories = ['T-Shirts', 'Hoodies', 'Bottoms', 'Accessories'];

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  image: '',
  category: 'T-Shirts',
  stock: 0,
  featured: false,
};

// --- COMPONENTS ---
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[100] transition-all transform animate-in slide-in-from-right-full ${
    type === 'error' ? 'bg-red-500 text-white' : 'bg-orange-600 text-white'
  }`}>
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [toast, setToast] = useState(null);

  // 1. FETCH DATA ON MOUNT
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProductsApi();
      // Ensure we handle different possible API response structures
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 2. API HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        await updateProductApi(editingProduct.id, formData);
        showToast('Product updated successfully');
      } else {
        await addProductApi(formData);
        showToast('Product added successfully');
      }
      fetchProducts(); // Refresh list
      closeDialog();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProductApi(id);
      showToast('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsAddOpen(true);
  };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  return (
    <div className="min-h-screen bg-orange-50/50 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-white border-b border-orange-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </Link>
            <h1 className="font-bold text-lg">Inventory Control</h1>
          </div>
          <Link to="/dashboard" className="text-sm font-medium text-orange-600 flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Exit to Store
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Package/>} label="Total Items" value={products.length} color="bg-blue-500" />
          <StatCard icon={<Star/>} label="Featured" value={products.filter(p=>p.featured).length} color="bg-orange-500" />
          <StatCard icon={<ShoppingBag/>} label="Low Stock" value={products.filter(p=>p.stock <= 5).length} color="bg-red-500" />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-6 border-b border-orange-50 flex items-center justify-between">
            <h2 className="font-bold text-xl">Product List</h2>
            <button 
              onClick={() => { setFormData(emptyProduct); setIsAddOpen(true); }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 hover:bg-black transition-all"
            >
              <Plus className="w-4 h-4"/> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-500 animate-pulse">Loading inventory...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-orange-50/50 text-orange-900 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No products found. Start by adding one!</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-orange-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-orange-600">${Number(product.price).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isSubmitting ? closeDialog : undefined} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={closeDialog} disabled={isSubmitting}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-orange-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  disabled={isSubmitting}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Mark as Featured Product</label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 disabled:bg-orange-300"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default Admin;