import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../lib/store';
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

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[100] ${
    type === 'error' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
  }`}>
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const Admin = () => {
  // Destructure including fetchProducts and loading states from store
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts, isLoading } = useProductStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [toast, setToast] = useState(null);

  // 1. Fetch products from PostgreSQL via Sequelize on load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 2. Handle Async Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.price <= 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingProduct) {
        // Sequelize uses 'id' by default
        await updateProduct(editingProduct.id, formData);
        showToast('Product updated successfully');
      } else {
        await addProduct(formData);
        showToast('Product added successfully');
      }
      closeDialog();
    } catch (error) {
      showToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
      featured: product.featured,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        showToast('Product deleted');
      } catch (error) {
        showToast('Failed to delete product', 'error');
      }
    }
  };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Product Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Price *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stock</label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL</label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
        />
        <label htmlFor="featured" className="text-sm font-medium">
          Featured Product
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={closeDialog}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
        >
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-orange-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="bg-white border-b border-orange-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">MyMerch</span>
              </Link>
              <span className="text-orange-300">/</span>
              <span className="font-medium text-orange-600">Admin Dashboard</span>
            </div>
            <Link to="/">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter((p) => p.featured).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-100">
          <div className="flex items-center justify-between p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Products</h2>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-700 px-6 py-3">Product</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-6 py-3">Category</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-6 py-3">Price</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-6 py-3">Stock</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-6 py-3">Featured</th>
                    <th className="text-right text-sm font-medium text-gray-700 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-orange-100 border border-orange-200 flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-orange-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-1 max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.featured && <Star className="w-5 h-5 text-orange-500 fill-orange-500" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(product)} className="p-2 hover:bg-orange-50 rounded-md text-orange-600">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-600">No products yet</p>
              <button onClick={() => setIsAddOpen(true)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Add/Edit */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-orange-200">
            <div className="p-6 border-b border-orange-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeDialog} className="p-1 hover:bg-orange-100 rounded text-orange-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;