import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Plus, Pencil, Trash2, Package,
  Star, X, Loader2, ImagePlus, LogOut
} from 'lucide-react';
import { 
  getProductsApi, addProductApi, updateProductApi, deleteProductApi 
} from '../../services/api';

const categories = ['T-Shirts', 'Hoodies', 'Bottoms', 'Accessories'];
const statusOptions = ['available', 'out_of_stock', 'discontinued'];

const emptyProduct = {
  name: '', description: '', price: 0,
  category: 'T-Shirts', stock: 0, featured: false, status: 'available'
};

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[100] ${
    type === 'error' ? 'bg-red-500 text-white' : 'bg-orange-600 text-white'
  }`}>
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
  </div>
);

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts]             = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData]             = useState(emptyProduct);
  const [imageFile, setImageFile]           = useState(null);
  const [imagePreview, setImagePreview]     = useState('');
  const [toast, setToast]                   = useState(null);

  const BASE_URL = 'http://localhost:4000';

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProductsApi();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name',        formData.name);
      data.append('description', formData.description);
      data.append('price',       formData.price);
      data.append('stock',       formData.stock);
      data.append('category',    formData.category);
      data.append('featured',    formData.featured);
      data.append('status',      formData.status || 'available');
      if (imageFile) data.append('image', imageFile);

      if (editingProduct) {
        await updateProductApi(editingProduct.id, data);
        showToast('Product updated successfully');
      } else {
        await addProductApi(data);
        showToast('Product added successfully');
      }
      fetchProducts();
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
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setImageFile(null);
    setImagePreview(product.image ? `${BASE_URL}/${product.image}` : '');
    setIsAddOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => { setImageFile(null); setImagePreview(''); };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
    setImageFile(null);
    setImagePreview('');
  };

  const field = (label, children) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 text-sm";

  return (
    <div className="min-h-screen bg-orange-50/50 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg">Inventory Control</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Package />}      label="Total Items" value={products.length}                          color="bg-blue-500" />
          <StatCard icon={<Star />}          label="Featured"    value={products.filter(p => p.featured).length}  color="bg-orange-500" />
          <StatCard icon={<ShoppingBag />}  label="Low Stock"   value={products.filter(p => p.stock <= 5).length} color="bg-red-500" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="p-6 border-b border-orange-50 flex items-center justify-between">
            <h2 className="font-bold text-xl">Product List</h2>
            <button
              onClick={() => { setFormData(emptyProduct); setImageFile(null); setImagePreview(''); setIsAddOpen(true); }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 hover:bg-black transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-500">Loading inventory...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-orange-50/50 text-orange-900 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-400">No products found. Start by adding one!</td>
                    </tr>
                  ) : products.map(product => (
                    <tr key={product.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-orange-100">
                            {product.image ? (
                              <img src={`${BASE_URL}/${product.image}`} alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImagePlus className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[180px]">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-orange-600 text-sm">${Number(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${
                          product.status === 'available'    ? 'bg-green-100 text-green-700'  :
                          product.status === 'out_of_stock' ? 'bg-yellow-100 text-yellow-700' :
                                                              'bg-red-100 text-red-700'
                        }`}>
                          {product.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isSubmitting ? closeDialog : undefined} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-orange-100">
              <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={closeDialog} disabled={isSubmitting}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={handleSubmit} id="product-form" className="space-y-4">

                {field('Product Image',
                  <div className="space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-orange-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={clearImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-orange-200 rounded-xl cursor-pointer hover:bg-orange-50/50 transition-colors">
                        <ImagePlus className="w-8 h-8 text-orange-300 mb-2" />
                        <span className="text-sm text-gray-400 font-medium">Click to upload image</span>
                        <span className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP · Max 5MB</span>
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden" onChange={handleImageChange} disabled={isSubmitting} />
                      </label>
                    )}
                  </div>
                )}

                {field('Product Name',
                  <input type="text" required disabled={isSubmitting} value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass} placeholder="e.g. Classic White Tee" />
                )}

                {field('Description',
                  <textarea required rows={3} disabled={isSubmitting} value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={inputClass} placeholder="Describe the product..." />
                )}

                <div className="grid grid-cols-2 gap-4">
                  {field('Price ($)',
                    <input type="number" step="0.01" min="0" disabled={isSubmitting} value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className={inputClass} />
                  )}
                  {field('Stock',
                    <input type="number" min="0" disabled={isSubmitting} value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className={inputClass} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {field('Category',
                    <select value={formData.category} disabled={isSubmitting}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className={inputClass + ' bg-white'}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                  {field('Status',
                    <select value={formData.status || 'available'} disabled={isSubmitting}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className={inputClass + ' bg-white capitalize'}>
                      {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" id="featured" disabled={isSubmitting}
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Mark as Featured Product</label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-orange-100">
              <button type="submit" form="product-form" disabled={isSubmitting}
                className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 disabled:bg-orange-300">
                {isSubmitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  : editingProduct ? 'Update Product' : 'Create Product'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default Admin;