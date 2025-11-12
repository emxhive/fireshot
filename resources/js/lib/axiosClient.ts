import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  r => r,
  e => {
    console.error('API Error:', e?.response?.data || e?.message);
    return Promise.reject(e);
  }
);

export default api;
