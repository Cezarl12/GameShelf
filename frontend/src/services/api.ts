import axios from 'axios';
import type { ApiErrorResponse } from '../types/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(
  error: unknown,
  fallback = 'A apărut o eroare neașteptată. Încearcă din nou.'
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (!error.response) {
      return 'Nu s-a putut stabili conexiunea cu serverul. Verifică dacă backend-ul rulează.';
    }
  }
  return fallback;
}

export default api;
