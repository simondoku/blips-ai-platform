// client/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if user is already logged in using stored token
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set the user from localStorage
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setIsAuthenticated(true);
          
          // Optionally validate token with the server
          try {
            // Get fresh user data from the server
            const response = await api.get('/auth/me');
            if (response.data) {
              setCurrentUser(response.data);
            }
          } catch (error) {
            // If token is invalid, clear localStorage
            if (error.response && error.response.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Register a new user
  const register = async ({ email, password, username, displayName }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', {
        email,
        password,
        username,
        displayName: displayName || username
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint (optional - mostly for token blacklisting)
      await api.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if server logout fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      
      // If there's a file, create FormData for multipart request
      if (profileData.profileImage instanceof File) {
        const formData = new FormData();
        formData.append('profileImage', profileData.profileImage);
        
        if (profileData.username) formData.append('username', profileData.username);
        if (profileData.displayName) formData.append('displayName', profileData.displayName);
        
        // Upload with multipart/form-data
        const response = await api.put('/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const { user } = response.data;
        
        // Update localStorage and state
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        
        return user;
      } else {
        // Regular JSON update without file
        const response = await api.put('/users/profile', {
          username: profileData.username,
          displayName: profileData.displayName
        });
        
        const { user } = response.data;
        
        // Update localStorage and state
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        
        return user;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;