import axios from 'axios';
import { mockBikes, mockUser, mockRideHistory, createMockRide } from './mockData';

// Create axios instance - configure baseURL when backend is ready
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Flag to use mock data (controlled by AppContext)
let useMockData = true;

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
    const response = await api.get('/bikes/available');
    return response.data;
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
    return response.data;
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
    const response = await api.post('/rides/end', { rideId });
    return response.data;
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
    return response.data;
}

// ============== USER ENDPOINTS ==============

/**
 * Get current user profile
 * @returns {Promise<import('../types').User>}
 */
export async function getUserProfile() {
    if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockUser;
    }
    const response = await api.get('/user/profile');
    return response.data;
}

export default api;
