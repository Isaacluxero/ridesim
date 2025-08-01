/**
 * Main simulation state hook for fetching and polling simulation data.
 */

import { useState, useEffect, useCallback } from 'react';
import { SimulationState } from '../types/simulation';
import { getSimulationState } from '../services/api-client';

export function useSimulation() {
    const [state, setState] = useState<SimulationState | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch current simulation state from backend.
     */
    const fetchState = useCallback(async () => {
        try {
            console.log('Fetching simulation state...');
            const data = await getSimulationState();
            console.log('Received simulation state:', data);
            console.log('Drivers in state:', data.drivers);
            console.log('Riders in state:', data.riders);
            setState(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch simulation state:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch state');
        }
    }, []);

    /**
     * Toggle polling on/off.
     */
    const togglePolling = useCallback(() => {
        setIsPolling(prev => !prev);
    }, []);

    // Poll for updates when polling is enabled
    useEffect(() => {
        if (!isPolling) return;

        const interval = setInterval(fetchState, 1000);
        return () => clearInterval(interval);
    }, [isPolling, fetchState]);

    // Initial fetch
    useEffect(() => {
        fetchState();
    }, [fetchState]);

    return {
        state,
        isPolling,
        togglePolling,
        fetchState,
        error,
    };
} 