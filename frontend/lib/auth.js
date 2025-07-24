import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    // Set proper headers for FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post('/auth/register', userData, config);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  logout: () => {
    Cookies.remove('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.put('/auth/profile', profileData, config);
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  }
};

export const blogAPI = {
  getAllBlogs: async (params = {}) => {
    const response = await api.get('/blogs', { params });
    return response.data;
  },

  getBlog: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  getUserBlogs: async (params = {}) => {
    const response = await api.get('/blogs/my-blogs', { params });
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await api.get(`/blogs/edit/${id}`);
    return response.data;
  }
};

export const commentAPI = {
  getBlogComments: async (blogId, params = {}) => {
    const response = await api.get(`/comments/blog/${blogId}`, { params });
    return response.data;
  },

  createComment: async (blogId, commentData) => {
    const response = await api.post(`/comments/blog/${blogId}`, commentData);
    return response.data;
  },

  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  toggleCommentLike: async (id) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  }
};

export const reportAPI = {
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  getAllReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  updateReportStatus: async (id, statusData) => {
    const response = await api.put(`/reports/${id}`, statusData);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  getReportStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Blog Management
  getAllBlogsAdmin: async (params = {}) => {
    const response = await api.get('/admin/blogs', { params });
    return response.data;
  },

  deleteBlogAdmin: async (id) => {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  },

  // Comment Management
  getAllCommentsAdmin: async (params = {}) => {
    const response = await api.get('/admin/comments', { params });
    return response.data;
  },

  deleteCommentAdmin: async (id) => {
    const response = await api.delete(`/admin/comments/${id}`);
    return response.data;
  },

  // Report Management
  getAllReportsAdmin: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  updateReportStatusAdmin: async (id, statusData) => {
    const response = await api.put(`/admin/reports/${id}/status`, statusData);
    return response.data;
  },

  deleteReportAdmin: async (id) => {
    const response = await api.delete(`/admin/reports/${id}`);
    return response.data;
  }
};

export default api;