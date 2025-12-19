import { createContext, useContext, useState, useCallback } from 'react';
import { APP_STATES } from '../types';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [appState, setAppState] = useState(APP_STATES.DISCOVERY);
    const [currentRide, setCurrentRide] = useState(null);
    const [selectedBike, setSelectedBike] = useState(null);
    const [mockMode, setMockMode] = useState(true); // Start in mock mode

    const openScanner = useCallback(() => {
        setAppState(APP_STATES.SCANNING);
    }, []);

    const closeScanner = useCallback(() => {
        setAppState(APP_STATES.DISCOVERY);
    }, []);

    const startRide = useCallback((ride, bike) => {
        setCurrentRide(ride);
        setSelectedBike(bike);
        setAppState(APP_STATES.RIDING);
    }, []);

    const endRide = useCallback(() => {
        setCurrentRide(null);
        setSelectedBike(null);
        setAppState(APP_STATES.DISCOVERY);
    }, []);

    const selectBike = useCallback((bike) => {
        setSelectedBike(bike);
    }, []);

    const toggleMockMode = useCallback(() => {
        setMockMode(prev => !prev);
    }, []);

    const value = {
        // State
        appState,
        currentRide,
        selectedBike,
        mockMode,
        // Actions
        openScanner,
        closeScanner,
        startRide,
        endRide,
        selectBike,
        toggleMockMode
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
