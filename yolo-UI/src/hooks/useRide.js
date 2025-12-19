import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const RATE_PER_MINUTE = 2; // ₹2 per minute

/**
 * Hook to manage active ride state and timer
 * @returns {{ elapsedTime: number, estimatedCost: number, formatTime: (seconds: number) => string }}
 */
export function useRide() {
    const { currentRide, selectedBike } = useApp();
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!currentRide) {
            setElapsedTime(0);
            return;
        }

        // Calculate initial elapsed time
        const startTime = new Date(currentRide.startTime).getTime();
        const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(initialElapsed);

        // Update every second
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentRide]);

    const formatTime = useCallback((seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const estimatedCost = Math.ceil(elapsedTime / 60) * RATE_PER_MINUTE;

    return {
        elapsedTime,
        estimatedCost,
        formatTime,
        batteryLevel: selectedBike?.batteryLevel || 0
    };
}
