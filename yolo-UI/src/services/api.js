import axios from 'axios';
import { mockBikes, mockUser, mockRideHistory, createMockRide } from './mockData';

// Create axios instance - configured for deployed backend
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

// Flag to use mock data (controlled by AppContext)
let useMockData = false; // Default to real API now

export function setMockMode(enabled) {
    useMockData = enabled;
}

// ============== BIKE ENDPOINTS ==============

/**
 * Get all available bikes
 * @returns {Promise<import('../types').Bike[]>}
 */
export async function getAvailableBikes() {
    if (useMockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockBikes.filter(b => b.status === 'available');
    }
    const response = await api.get('/bikes');
    return response.data.bikes;
}

// ============== RIDE ENDPOINTS ==============

/**
 * Unlock a bike and start a ride
 * @param {string} bikeId 
 * @returns {Promise<import('../types').Ride>}
 */
export async function unlockBike(bikeId) {
    if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return createMockRide(bikeId);
    }
    const response = await api.post('/rides/unlock', { bikeId });
    return response.data.data;
}

/**
 * End the current ride
 * @param {string} rideId 
 * @returns {Promise<{ride: import('../types').Ride, cost: number}>}
 */
export async function endRide(rideId) {
    if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            ride: {
                id: rideId,
                bikeId: 'BIKE001',
                startTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
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
    const response = await api.put(`/rides/${rideId}/end`);
    return response.data.data;
}

/**
 * Get ride history
 * @returns {Promise<import('../types').Ride[]>}
 */
export async function getRideHistory() {
    if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockRideHistory;
    }
    const response = await api.get('/rides/history');
    return response.data.data;
}

// ============== USER ENDPOINTS ==============

/**
 * Register a new user
 * @param {{ email: string, password: string, name: string, phone?: string }} userData
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function registerUser(userData) {
    const response = await api.post('/users/register', userData);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    return { user, token };
}

/**
 * Login user
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
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
 * @returns {Promise<import('../types').User>}
 */
export async function getUserProfile() {
    if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockUser;
    }
    const response = await api.get('/users/profile');
    return response.data.data;
}

/**
 * Update user profile
 * @param {{ name?: string, phone?: string, avatar?: string }} updateData
 * @returns {Promise<import('../types').User>}
 */
export async function updateUserProfile(updateData) {
    const response = await api.put('/users/profile', updateData);
    return response.data.data;
}

/**
 * Add balance to wallet
 * @param {number} amount
 * @returns {Promise<{ balance: number }>}
 */
export async function addBalance(amount) {
    const response = await api.post('/users/balance/add', { amount });
    return response.data.data;
}

export default api;
