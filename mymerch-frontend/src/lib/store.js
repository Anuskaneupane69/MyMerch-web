import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/products';

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(API_URL);
      set({ products: res.data, isLoading: false });
    } catch (err) {
      console.error("Error fetching products", err);
      set({ isLoading: false });
    }
  },

  addProduct: async (productData) => {
    try {
      const res = await axios.post(API_URL, productData);
      set((state) => ({ products: [res.data, ...state.products] }));
    } catch (err) { throw err; }
  },

  updateProduct: async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, updatedData);
      set((state) => ({
        // Use p.id (Sequelize style)
        products: state.products.map((p) => (p.id === id ? res.data : p)),
      }));
    } catch (err) { throw err; }
  },

  deleteProduct: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        // Use p.id (Sequelize style)
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (err) { throw err; }
  },
}));