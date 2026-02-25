import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('token_expiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
