import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const guestToken = localStorage.getItem('hotel_os_guest_token');
  const staffToken = localStorage.getItem('hotel_os_staff_token');
  const token = staffToken || guestToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hotel_os_guest_token');
      localStorage.removeItem('hotel_os_staff_token');
    }
    return Promise.reject(err);
  }
);

export default API;
