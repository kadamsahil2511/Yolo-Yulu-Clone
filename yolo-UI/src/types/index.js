/**
 * @typedef {Object} Bike
 * @property {string} id
 * @property {number} batteryLevel - 0-100
 * @property {number} lat
 * @property {number} lng
 * @property {'available' | 'in-use' | 'maintenance'} status
 * @property {string} model
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {number} balance
 * @property {number} totalRides
 * @property {string} avatar
 */

/**
 * @typedef {Object} Ride
 * @property {string} id
 * @property {string} bikeId
 * @property {string} startTime - ISO string
 * @property {string} [endTime] - ISO string
 * @property {{lat: number, lng: number}} startLocation
 * @property {{lat: number, lng: number}} [endLocation]
 * @property {number} cost
 * @property {number} distance
 * @property {'active' | 'completed'} status
 */

/** @typedef {'DISCOVERY' | 'SCANNING' | 'RIDING'} AppState */

export const APP_STATES = {
    DISCOVERY: 'DISCOVERY',
    SCANNING: 'SCANNING',
    RIDING: 'RIDING'
};
