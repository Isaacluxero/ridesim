/**
 * Hook for simulation control operations.
 */

import { useState, useCallback, useRef } from 'react';
import { advanceTick, resetSimulation, initializeSimulation as apiInitializeSimulation } from '../services/api-client';

export function useSimulationControl() {
    const [isSimulationLoading, setIsSimulationLoading] = useState(false);
    const isAdvancingRef = useRef(false);

    /**
     * Advance the simulation by one tick.
     */
    const advanceTickHandler = useCallback(async () => {
        if (isAdvancingRef.current) return;

        try {
            isAdvancingRef.current = true;
            setIsSimulationLoading(true);
            console.log('Advancing simulation tick...');

            await advanceTick();
            console.log('Tick advanced successfully');

            // Small delay to prevent rapid clicking
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('Failed to advance tick:', error);
            throw error;
        } finally {
            isAdvancingRef.current = false;
            setIsSimulationLoading(false);
        }
    }, []);

    /**
     * Reset the simulation to initial state.
     */
    const resetSimulationHandler = useCallback(async () => {
        try {
            setIsSimulationLoading(true);
            console.log('Resetting simulation...');

            await resetSimulation();
            console.log('Simulation reset successfully');
        } catch (error) {
            console.error('Failed to reset simulation:', error);
            throw error;
        } finally {
            setIsSimulationLoading(false);
        }
    }, []);

    /**
     * Initialize the simulation.
     */
    const initializeSimulation = useCallback(async () => {
        try {
            console.log('Initializing simulation...');
            // Call the backend initialize endpoint which adds sample drivers
            await apiInitializeSimulation();
            console.log('Simulation initialized successfully');
        } catch (error) {
            console.error('Failed to initialize simulation:', error);
            throw error;
        }
    }, []);

    return {
        advanceTick: advanceTickHandler,
        resetSimulation: resetSimulationHandler,
        initializeSimulation,
        isSimulationLoading,
    };
} 