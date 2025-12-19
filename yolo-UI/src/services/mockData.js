// Mock data for testing UI before backend is ready

/** @type {import('../types').Bike[]} */
export const mockBikes = [
    {
        id: 'BIKE001',
        batteryLevel: 87,
        lat: 18.5204,
        lng: 73.8567,
        status: 'available',
        model: 'Yolo E-Bike Pro'
    },
    {
        id: 'BIKE002',
        batteryLevel: 45,
        lat: 18.5224,
        lng: 73.8547,
        status: 'available',
        model: 'Yolo E-Bike Lite'
    },
    {
        id: 'BIKE003',
        batteryLevel: 92,
        lat: 18.5184,
        lng: 73.8597,
        status: 'available',
        model: 'Yolo E-Bike Pro'
    },
    {
        id: 'BIKE004',
        batteryLevel: 23,
        lat: 18.5244,
        lng: 73.8527,
        status: 'available',
        model: 'Yolo E-Bike Lite'
    },
    {
        id: 'BIKE005',
        batteryLevel: 68,
        lat: 18.5164,
        lng: 73.8607,
        status: 'in-use',
        model: 'Yolo E-Bike Pro'
    }
];

/** @type {import('../types').User} */
export const mockUser = {
    id: 'USER001',
    name: 'Sahil Shah',
    email: 'sahil@example.com',
    balance: 250.00,
    totalRides: 24,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahil'
};

/** @type {import('../types').Ride[]} */
export const mockRideHistory = [
    {
        id: 'RIDE001',
        bikeId: 'BIKE002',
        startTime: '2024-12-18T10:30:00Z',
        endTime: '2024-12-18T11:15:00Z',
        startLocation: { lat: 18.5204, lng: 73.8567 },
        endLocation: { lat: 18.5284, lng: 73.8487 },
        cost: 90,
        distance: 4.2,
        status: 'completed'
    },
    {
        id: 'RIDE002',
        bikeId: 'BIKE001',
        startTime: '2024-12-17T14:00:00Z',
        endTime: '2024-12-17T14:45:00Z',
        startLocation: { lat: 18.5224, lng: 73.8547 },
        endLocation: { lat: 18.5164, lng: 73.8607 },
        cost: 90,
        distance: 3.8,
        status: 'completed'
    },
    {
        id: 'RIDE003',
        bikeId: 'BIKE003',
        startTime: '2024-12-15T09:00:00Z',
        endTime: '2024-12-15T09:30:00Z',
        startLocation: { lat: 18.5184, lng: 73.8597 },
        endLocation: { lat: 18.5244, lng: 73.8527 },
        cost: 60,
        distance: 2.5,
        status: 'completed'
    }
];

/**
 * Create a mock ride for testing
 * @param {string} bikeId 
 * @returns {import('../types').Ride}
 */
export function createMockRide(bikeId) {
    return {
        id: `RIDE${Date.now()}`,
        bikeId,
        startTime: new Date().toISOString(),
        startLocation: { lat: 18.5204, lng: 73.8567 },
        cost: 0,
        distance: 0,
        status: 'active'
    };
}
