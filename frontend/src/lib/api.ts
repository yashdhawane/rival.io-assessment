import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

console.log('[API] API_URL:', API_URL)

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
})

// Add request interceptor to include token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.baseURL)
    console.log('[API] Full URL:', (config.baseURL || '') + (config.url || ''))
    console.log('[API] Token present:', token ? 'yes' : 'no')
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.config?.url, error.message)
    return Promise.reject(error)
  }
)

export const authApi = {
  signup: (data: { email: string; password: string }) =>
    api.post('/api/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  updatePreferences: (data: { themePreference: string }) =>
    api.patch('/api/user/preferences', data),
}

export const taskApi = {
  create: (data: any) => api.post('/api/tasks', data),
  getAll: (params?: any) => api.get('/api/tasks', { params }),
  getById: (id: string) => api.get(`/api/tasks/${id}`),
  update: (id: string, data: any) => api.patch(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
}

export const attachmentApi = {
  upload: (taskId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/attachments/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getByTaskId: (taskId: string) => api.get(`/api/attachments/tasks/${taskId}/attachments`),
  delete: (taskId: string, attachmentId: string) =>
    api.delete(`/api/attachments/tasks/${taskId}/attachments/${attachmentId}`),
}

export const activityApi = {
  getByTaskId: (taskId: string, limit?: number) =>
    api.get(`/api/activities/tasks/${taskId}/activities`, { params: { limit } }),
}
