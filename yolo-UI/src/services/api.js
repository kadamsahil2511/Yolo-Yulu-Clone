import axios from 'axios';
import { mockBikes, mockUser, mockRideHistory, createMockRide } from './mockData';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============== BIKE ENDPOINTS ==============

/**
 * Get all available bikes - with fallback to mock data
 */
export async function getAvailableBikes() {
    try {
        const response = await api.get('/bikes');
        return response.data.bikes || [];
    } catch (error) {
        console.warn('API unavailable, using fallback data:', error.message);
        return mockBikes.filter(b => b.status === 'available');
    }
}

// ============== RIDE ENDPOINTS ==============

/**
 * Unlock a bike and start a ride
 */
export async function unlockBike(bikeId) {
    try {
        const response = await api.post('/rides/unlock', { bikeId });
        return response.data.data;
    } catch (error) {
        console.warn('API unavailable, using mock ride:', error.message);
        return createMockRide(bikeId);
    }
}

/**
 * End the current ride
 */
export async function endRide(rideId) {
    try {
        const response = await api.put(`/rides/${rideId}/end`);
        return response.data.data;
    } catch (error) {
        console.warn('API unavailable, using mock end ride:', error.message);
        return {
            ride: {
                id: rideId,
                bikeId: 'BIKE001',
                startTime: new Date(Date.now() - 1800000).toISOString(),
                endTime: new Date().toISOString(),
                startLocation: { lat: 18.5204, lng: 73.8567 },
                endLocation: { lat: 18.5284, lng: 73.8487 },
                cost: 60,
                distance: 3.2,
                status: 'completed'
            },
            cost: 60
        };
    }
}

/**
 * Get ride history
 */
export async function getRideHistory() {
    try {
        const response = await api.get('/rides/history');
        return response.data.data || [];
    } catch (error) {
        console.warn('API unavailable, using mock history:', error.message);
        return mockRideHistory;
    }
}

// ============== USER ENDPOINTS ==============

/**
 * Register a new user
 */
export async function registerUser(userData) {
    const response = await api.post('/users/register', userData);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    return { user, token };
}

/**
 * Login user
 */
export async function loginUser(credentials) {
    const response = await api.post('/users/login', credentials);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    return { user, token };
}

/**
 * Logout user
 */
export function logoutUser() {
    localStorage.removeItem('token');
}

/**
 * Get current user profile
 */
export async function getUserProfile() {
    try {
        const response = await api.get('/users/profile');
        return response.data.data;
    } catch (error) {
        console.warn('API unavailable, using mock user:', error.message);
        return mockUser;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updateData) {
    try {
        const response = await api.put('/users/profile', updateData);
        return response.data.data;
    } catch (error) {
        console.warn('API unavailable:', error.message);
        return { ...mockUser, ...updateData };
    }
}

/**
 * Add balance to wallet
 */
export async function addBalance(amount) {
    try {
        const response = await api.post('/users/balance/add', { amount });
        return response.data.data;
    } catch (error) {
        console.warn('API unavailable:', error.message);
        return { balance: mockUser.balance + amount };
    }
}

export default api;
