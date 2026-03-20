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
    if (config._skipAuthInterceptor) {
      return config;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// apiClient.interceptors.request.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//     }
//     return Promise.reject(error);
//   },
// );

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    let originalRequest = error.config;

    if (originalRequest._skipAuthInterceptor) {
      return Promise.reject(error);
    }

    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!accessToken || !refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(error);
      }

      try {
        let response = await api.refresh(refreshToken);
        let isRefreshExpired = response.refresh_expired;
        if (isRefreshExpired) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }
        let newAccessToken = response.accessToken;
        let newRefreshToken = response.refreshToken;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
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

    const { accessToken, refreshToken } = response.data;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    return response.data;
  },
  registerUser: async (credentials) => {
    let response = await apiClient.post("/auth/register", credentials);
    return response.data;
  },
  checkUser: async () => {
    let response = await apiClient.get("/auth/me");
    return response.data;
  },
  refresh: async (refreshToken) => {
    let response = await apiClient.post(
      "/auth/refresh",
      { refreshToken },
      {
        _skipAuthInterceptor: true,
      },
    );
    return response.data;
  },
  getAllUsers: async () => {
    let response = await apiClient.get("/users");
    return response.data;
  },
  updateUser: async (id, userData) => {
    let response = await apiClient.patch(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    let response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};
