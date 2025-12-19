import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { APP_STATES } from '../types';
import { loginUser, registerUser, logoutUser, getUserProfile } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [appState, setAppState] = useState(APP_STATES.DISCOVERY);
    const [currentRide, setCurrentRide] = useState(null);
    const [selectedBike, setSelectedBike] = useState(null);

    // Auth state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUserProfile();
        } else {
            setAuthLoading(false);
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await getUserProfile();
            setUser(profile);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to load profile:', error);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        } finally {
            setAuthLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const { user } = await loginUser({ email, password });
        setUser(user);
        setIsAuthenticated(true);
        return user;
    }, []);

    const signup = useCallback(async (email, password, name) => {
        const { user } = await registerUser({ email, password, name });
        setUser(user);
        setIsAuthenticated(true);
        return user;
    }, []);

    const logout = useCallback(() => {
        logoutUser();
        setUser(null);
        setIsAuthenticated(false);
        setCurrentRide(null);
        setSelectedBike(null);
        setAppState(APP_STATES.DISCOVERY);
    }, []);

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

    const value = {
        // State
        appState,
        currentRide,
        selectedBike,
        // Auth
        user,
        isAuthenticated,
        authLoading,
        // Actions
        login,
        signup,
        logout,
        openScanner,
        closeScanner,
        startRide,
        endRide,
        selectBike
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
