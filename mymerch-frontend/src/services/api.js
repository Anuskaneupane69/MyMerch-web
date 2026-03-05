import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Instance for Multipart Form Data (file uploads)
export const ApiFormData = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// Instance for standard JSON requests
export const Api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    },
});

// Helper to get fresh config with token
export const getConfig = () => ({
    headers: {
        authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
});

// Helper for multipart config with token
export const getFormConfig = () => ({
    headers: {
        authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        "Content-Type": "multipart/form-data",
    },
});

// Auth APIs
export const registerUserApi = (data) => Api.post("/api/user/register", data);
export const loginUserApi    = (data) => Api.post("/api/user/login", data);

// Product APIs — add/update use ApiFormData for image uploads
export const getProductsApi   = ()          => Api.get("/api/products/getall",          getConfig());
export const addProductApi    = (data)      => ApiFormData.post("/api/products/add",     data, getFormConfig());
export const updateProductApi = (id, data)  => ApiFormData.put(`/api/products/update/${id}`, data, getFormConfig());
export const deleteProductApi = (id)        => Api.delete(`/api/products/delete/${id}`, getConfig());

// Review APIs
export const getReviewsByProductApi = (productId) => Api.get(`/api/reviews/${productId}`,  getConfig());
export const addReviewApi           = (productId, data) => Api.post(`/api/reviews/${productId}`, data, getConfig());
export const deleteReviewApi        = (id)        => Api.delete(`/api/reviews/${id}`,      getConfig());

// Order APIs
export const getUserOrdersApi = ()       => Api.get('/api/orders/my',        getConfig());
export const getAllOrdersApi  = ()       => Api.get('/api/orders/all',        getConfig());
export const createOrderApi  = (data)   => Api.post('/api/orders',           data, getConfig());
export const deleteOrderApi  = (id)     => Api.delete(`/api/orders/${id}`,   getConfig());

export const getWishlistApi    = ()           => Api.get('/api/wishlist',              getConfig());
export const toggleWishlistApi = (productId)  => Api.post(`/api/wishlist/${productId}`, {}, getConfig());
export const clearWishlistApi  = ()           => Api.delete('/api/wishlist/clear',     getConfig());