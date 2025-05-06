import React, { createContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getUserProfile, setToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      console.log('User profile fetched:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email, 'password:', password);
      // Kiểm tra dữ liệu đầu vào
      if (typeof email !== 'string' || typeof password !== 'string') {
        console.error('Invalid login input: email and password must be strings');
        throw new Error('Invalid login input: email and password must be strings');
      }
      const response = await loginApi({ email, password });
      const { token, user } = response.data;
      console.log('Login successful, token:', token, 'user:', user);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      await fetchUserProfile();
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email, password, name) => {
    try {
      console.log('Attempting register with email:', email, 'name:', name);
      const response = await registerApi({ email, password, name });
      const { token, user } = response.data;
      console.log('Register successful, token:', token, 'user:', user);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      await fetchUserProfile();
    } catch (error) {
      console.error('Register error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};