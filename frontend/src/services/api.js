import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Đảm bảo port khớp với backend
  withCredentials: true,
});

let csrfToken = null;

const getCsrfToken = async () => {
  if (!csrfToken) {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
  }
  return csrfToken;
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (['post', 'put', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = await getCsrfToken();
  }
  return config;
});

const setToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Existing endpoints
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const searchHotels = (params) => api.get('/hotels/search', { params });
export const createBooking = (data) => api.post('/bookings', data);
export const createPayment = (data) => api.post('/payments', data);
export const confirmPayment = (data) => api.post('/payments/confirm', data);
export const createReview = (data) => api.post('/reviews', data);
export const sendMessage = (data) => api.post('/messages', data);
export const getConversation = (otherUserId) => api.get(`/messages/${otherUserId}`);
export const getAllUsers = () => api.get('/admin/users');
export const getAllBookings = () => api.get('/admin/bookings');
export const getStats = () => api.get('/admin/stats');
export const confirmBooking = (id) => api.put(`/admin/bookings/${id}/confirm`);
export const getAllReviews = () => api.get('/reviews');
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const getAllRooms = () => api.get('/admin/rooms');
export const addRoom = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  return api.post('/admin/rooms', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateRoom = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  return api.put(`/admin/rooms/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteRoom = (id) => api.delete(`/admin/rooms/${id}`);

// Hotel endpoints
export const getAllHotels = () => api.get('/admin/hotels');
export const addHotel = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  return api.post('/admin/hotels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateHotel = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));
  return api.put(`/admin/hotels/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteHotel = (id) => api.delete(`/admin/hotels/${id}`);

// Endpoints for fetching hotel details and rooms
export const getHotel = (hotelId) => api.get(`/hotels/${hotelId}`);
export const getRoomsByHotel = (hotelId) => api.get(`/hotels/${hotelId}/rooms`);

// Endpoint for fetching a single booking
export const getBooking = (bookingId) => api.get(`/bookings/${bookingId}`);

// Endpoint for fetching all rooms (for regular users)
export const getRooms = () => api.get('/rooms');

// Add getBookings to fetch user's bookings
export const getBookings = () => api.get('/bookings');

// New endpoints (added while keeping existing ones)
export const cancelBooking = (bookingId) => api.delete(`/bookings/${bookingId}`);
export const updateBooking = (bookingId, data) => api.put(`/bookings/${bookingId}`, data);
export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/me', data);

// Thêm endpoint để lấy danh sách người dùng cho chat
export const getUsersForChat = () => api.get('/users/chat-users');

export { setToken };