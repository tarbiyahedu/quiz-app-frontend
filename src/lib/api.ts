import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiz-app-backend-pi.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Only redirect if we're not on public routes or register page
        const publicRoutes = ['/join', '/complete-quiz/live', '/leaderboard', '/quiz'];
        const isPublicRoute = publicRoutes.some(route => window.location.pathname.includes(route));
        if (!window.location.pathname.includes('/register') && !isPublicRoute) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { login: string; password: string }) =>
    api.post('/users/login', credentials),
  
  register: (userData: { name: string; email: string; password: string; departments: string[] }) =>
    api.post('/users/register', userData),
  
  googleLogin: (token: string) =>
    api.post('/users/google-login', { token }),
  
  getCurrentUser: () =>
    api.get('/users/me'),
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users/all'),
  getUserById: (id: string) => api.get(`/users/details/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/users/update/${id}`, data),
  updateOwnProfile: (data: any) => api.patch('/users/me', data),
  approveUser: (id: string, approved: boolean) => api.put(`/users/${id}/approve`, { approved }),
  deleteUser: (id: string) => api.delete(`/users/delete/${id}`),
  getUsersByDepartment: (departmentId: string) => api.get(`/users/department/${departmentId}`),
};

// Department API
export const departmentAPI = {
  getAllDepartments: (params?: any) => api.get('/departments', { params }),
  getActiveDepartments: () => api.get('/departments', { params: { isActive: true } }),
  getDepartmentById: (id: string) => api.get(`/departments/${id}`),
  createDepartment: (data: any) => api.post('/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id: string) => api.delete(`/departments/${id}`),
};

// Live Quiz API
export const liveQuizAPI = {
  getAllQuizzes: (params?: any) => api.get('/live-quizzes', { params }),
  getQuizById: (id: string) => api.get(`/live-quizzes/${id}`),
  getPublicQuizById: (id: string) => api.get(`/live-quizzes/public/${id}`),
  createQuiz: (data: any) => api.post('/live-quizzes', data),
  updateQuiz: (id: string, data: any) => api.put(`/live-quizzes/${id}`, data),
  deleteQuiz: (id: string) => api.delete(`/live-quizzes/${id}`),
  startQuiz: (id: string) => api.post(`/live-quizzes/${id}/start`),
  endQuiz: (id: string) => api.post(`/live-quizzes/${id}/end`),
  scheduleQuiz: (id: string, data: { liveStartAt: string; liveEndAt: string }) => 
    api.post(`/live-quizzes/${id}/schedule`, data),
  cancelSchedule: (id: string) => api.post(`/live-quizzes/${id}/cancel-schedule`),
  publishResults: (id: string, isPublic: boolean) => 
    api.post(`/live-quizzes/${id}/publish`, { isPublic }),
  getCompletedQuizzes: () => api.get('/live-quiz-answers/completed'),
  getCompletedQuizDetails: (quizId: string) => api.get(`/live-quiz-answers/completed/${quizId}`),
  getAllCompletedQuizzes: () => api.get('/live-quiz-answers/all-completed'),
  getQuizStatistics: (params?: any) => api.get('/live-quizzes/statistics', { params }),
  getQuizByCode: (code: string) => api.get(`/live-quizzes/code/${code}`),
};

// Live Quiz Questions API
export const liveQuizQuestionAPI = {
  getQuestionsByQuiz: (quizId: string) => api.get(`/live-quiz-questions/${quizId}`),
  getPublicQuestionsByQuiz: (quizId: string) => api.get(`/live-quiz-questions/public/${quizId}`),
  createQuestion: (data: any) => api.post('/live-quiz-questions', data),
  updateQuestion: (id: string, data: any) => api.put(`/live-quiz-questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/live-quiz-questions/${id}`),
};

// Live Quiz Answer API
export const liveQuizAnswerAPI = {
  submitAnswer: (data: any) => api.post('/live-quiz-answers/submit', data),
  submitMultipleAnswers: (data: any) => api.post('/live-quiz-answers/submit-multiple', data),
  submitMultipleAnswersGuest: (data: any) => api.post('/live-quiz-answers/submit-multiple-guest', data),
  getAnswers: (quizId: string, params?: any) => api.get(`/live-quiz-answers/${quizId}`, { params }),
  updateAnswer: (answerId: string, data: any) => api.put(`/live-quiz-answers/${answerId}`, data),
  deleteAnswer: (answerId: string) => api.delete(`/live-quiz-answers/${answerId}`),
  getCompletedQuizzes: () => api.get('/live-quiz-answers/completed'),
  getCompletedQuizDetails: (quizId: string) => api.get(`/live-quiz-answers/completed/${quizId}`),
  getAllCompletedQuizzes: () => api.get('/live-quiz-answers/all-completed'),
  getCompletedQuizDetailsForAdmin: (quizId: string) => api.get(`/live-quiz-answers/admin/completed/${quizId}`),
};

// Live Leaderboard API
export const liveLeaderboardAPI = {
  getLeaderboard: (quizId: string) => api.get(`/live-leaderboard/quiz/${quizId}`),
  updateScore: (data: any) => api.post('/live-leaderboard', data),
};

export const quizLeaderboardAPI = {
  getPublicLeaderboard: (quizId: string, filter: string = 'all') => api.get(`/live-leaderboard/quiz/${quizId}/public?filter=${filter}`),
};

export const publicQuizAPI = {
  getAllPublic: () => api.get('/live-quizzes/public'),
};

export default api; 