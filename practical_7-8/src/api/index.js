import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const api = {
  createProduct: async (product) => {
    let response = await apiClient.post("/products", product);
    return response.data;
  },
  getProducts: async () => {
    let response = await apiClient.get("/products");
    return response.data;
  },
  getProductrById: async (id) => {
    let response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  updateProduct: async (id, product) => {
    let response = await apiClient.patch(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id) => {
    let response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  authUser: async (credentials) => {
    let response = await apiClient.post("/auth/login", credentials);

    const { accessToken } = response.data;
    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }
    return response.data;
  },
  registerUser: async (credentials) => {
    let response = await apiClient.post("/auth/register", credentials);
    return response.data;
  },
};
