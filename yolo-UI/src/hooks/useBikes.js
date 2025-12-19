import { useState, useEffect } from 'react';
import { getAvailableBikes } from '../services/api';

/**
 * Hook to fetch and manage available bikes
 * @returns {{ bikes: import('../types').Bike[], loading: boolean, error: Error | null, refetch: () => void }}
 */
export function useBikes() {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBikes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAvailableBikes();
            setBikes(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    return { bikes, loading, error, refetch: fetchBikes };
}
