import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: { full_name?: string; avatar_url?: string }) =>
    api.patch("/auth/me", data),
};

// Voice API
export const voiceApi = {
  list: (params?: { language?: string; voice_type?: string; page?: number }) =>
    api.get("/voices", { params }),
  listSystem: (params?: { language?: string }) =>
    api.get("/voices/system", { params }),
  get: (id: string) => api.get(`/voices/${id}`),
  create: (data: { name: string; description?: string; language?: string }) =>
    api.post("/voices", data),
  update: (id: string, data: any) => api.patch(`/voices/${id}`, data),
  delete: (id: string) => api.delete(`/voices/${id}`),
  clone: (id: string, formData: FormData) =>
    api.post(`/voices/${id}/clone`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Generation API
export const generationApi = {
  list: (params?: { project_id?: string; status?: string; page?: number }) =>
    api.get("/generations", { params }),
  create: (data: any) => api.post("/generations", data),
  get: (id: string) => api.get(`/generations/${id}`),
  getAudio: (id: string) => api.get(`/generations/${id}/audio`),
  delete: (id: string) => api.delete(`/generations/${id}`),
  batch: (data: any) => api.post("/generations/batch", data),
};

// Project API
export const projectApi = {
  list: () => api.get("/projects"),
  create: (data: { name: string; description?: string; language?: string }) =>
    api.post("/projects", data),
  get: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export default api;
