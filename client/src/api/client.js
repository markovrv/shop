import axios from 'axios';

// Получаем базовый URL из настроек или используем локальный по умолчанию
const API_BASE_URL = localStorage.getItem('apiUrl') || (window.location.origin + '/api')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем токен аутентификации к каждому запросу из sessionStorage
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => (Promise.reject(error))
);

// Обработка ошибок и автоматический выход при 401
api.interceptors.response.use(
  response => response.data,
  error => {
    // Если получили 401 ошибку, удаляем токен и перенаправляем на страницу входа
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '#/login'; // Перенаправляем на главную
    }
    const message = error.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)

export const authApi = {
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials)
}

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`)
}

export const entriesApi = {
 getAll: (params = {}) => api.get('/entries', { params }),
  create: (data) => api.post('/entries', data),
  update: (id, data) => api.put(`/entries/${id}`, data),
  delete: (id) => api.delete(`/entries/${id}`)
}

export const balancesApi = {
  getAll: (startDate, endDate) => api.get('/balances', { params: { startDate, endDate } })
}

export const adminApi = {
  recalculate: () => api.post('/admin/recalculate'),
  health: () => api.get('/admin/health')
}