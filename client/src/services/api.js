// client/src/services/api.js
import axios from 'axios';

// Mock authentication system that works without a backend
const useMockAuth = false; // Set to true to use mock authentication

// Mock user data store
const mockUsers = [];
const getStoredMockUsers = () => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  return [];
};

const storeMockUsers = (users) => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

// Initialize mock users from localStorage
if (useMockAuth) {
  const storedUsers = getStoredMockUsers();
  if (storedUsers.length > 0) {
    mockUsers.push(...storedUsers);
  }
}

// Create a mock API handler
const mockApi = {
  post: async (endpoint, data) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Mock API POST request to ${endpoint}`, data);

    if (endpoint === '/auth/register') {
      const { username, email, password } = data;

      // Check if user already exists
      const existingUsers = getStoredMockUsers();
      if (existingUsers.some(user => user.email === email || user.username === username)) {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: 'User with that email or username already exists' }
          }
        });
      }

      // Create new user
      const newUser = {
        id: 'mock-' + Date.now(),
        username,
        email,
        displayName: username,
        profileImage: null,
        password, // In a real app, never store plain text passwords
        created: new Date().toISOString()
      };

      // Add to mock users
      mockUsers.push(newUser);
      storeMockUsers(mockUsers);

      // Create token (just a fake one)
      const token = `mock-token-${Date.now()}`;

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      return {
        data: {
          message: 'Registration successful (Mock)',
          user: userWithoutPassword,
          token
        }
      };
    }

    if (endpoint === '/auth/login') {
      const { email, password } = data;

      // Find user
      const user = mockUsers.find(u => u.email === email);
      if (!user || user.password !== password) {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Invalid credentials' }
          }
        });
      }

      // Create token (just a fake one)
      const token = `mock-token-${Date.now()}`;

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        data: {
          message: 'Login successful (Mock)',
          user: userWithoutPassword,
          token
        }
      };
    }

    if (endpoint === '/users/profile') {
      // Handle profile update
      const token = localStorage.getItem('token');
      if (!token) {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Unauthorized' }
          }
        });
      }

      const currentUserJson = localStorage.getItem('user');
      if (!currentUserJson) {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'User not found' }
          }
        });
      }

      const currentUser = JSON.parse(currentUserJson);
      const updatedUser = { ...currentUser, ...data };

      // Update mock user in the array
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedUser };
        storeMockUsers(mockUsers);
      }

      return {
        data: {
          message: 'Profile updated successfully',
          user: updatedUser
        }
      };
    }

    // Default fallback for unhandled endpoints
    return {
      data: {
        message: 'Mock API request successful',
        endpoint,
        data
      }
    };
  },

  get: async (endpoint) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Mock API GET request to ${endpoint}`);

    // Default response
    return {
      data: {
        message: 'Mock API request successful',
        endpoint
      }
    };
  },

  put: async (endpoint, data) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Mock API PUT request to ${endpoint}`, data);

    // Default response
    return {
      data: {
        message: 'Mock API request successful',
        endpoint,
        data
      }
    };
  },

  delete: async (endpoint) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Mock API DELETE request to ${endpoint}`);

    // Default response
    return {
      data: {
        message: 'Mock API request successful',
        endpoint
      }
    };
  }
};

// Create real API client
const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProd ? '/proxy-api' : 'http://localhost:5001/api');

console.log('Using API URL:', useMockAuth ? 'Mock API (No server needed)' : API_URL);

// Create an axios instance for real API calls
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 45000 // Increased from 10s to 45s to match server-side socket timeout
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Decide which API to use
const api = useMockAuth ? mockApi : axiosInstance;

export default api;