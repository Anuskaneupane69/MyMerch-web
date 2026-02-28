import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Instance for Multipart Form Data (useful for profile pictures/uploads)
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

export const registerUserApi = (data) => Api.post("/api/user/register", data);
export const loginUserApi = (data) => Api.post("/api/user/login", data);

// Product APIs
export const getProductsApi = () => Api.get("/api/products/getall", getConfig());   
export const addProductApi = (data) => Api.post("/api/products/add", data, getConfig());
export const updateProductApi = (id, data) => Api.put(`/api/products/update/${id}`, data, getConfig());
export const deleteProductApi = (id) => Api.delete(`/api/products/delete/${id}`, getConfig());