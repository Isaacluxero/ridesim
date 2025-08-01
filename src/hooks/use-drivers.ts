/**
 * Hook for driver-related operations.
 */

import { useCallback } from 'react';
import { addDriver, removeDriver } from '../services/api-client';

export function useDrivers() {
    /**
     * Add a new driver to the simulation.
     */
    const addDriverHandler = useCallback(async (x: number, y: number) => {
        try {
            console.log('Adding driver at position:', x, y);
            const driver = await addDriver(x, y);
            console.log('Driver added:', driver);
            return driver;
        } catch (error) {
            console.error('Failed to add driver:', error);
            throw error;
        }
    }, []);

    /**
     * Remove a driver from the simulation.
     */
    const removeDriverHandler = useCallback(async (driverId: string) => {
        try {
            console.log('Removing driver:', driverId);
            const success = await removeDriver(driverId);
            console.log('Driver removed:', success);
            return success;
        } catch (error) {
            console.error('Failed to remove driver:', error);
            throw error;
        }
    }, []);

    return {
        addDriver: addDriverHandler,
        removeDriver: removeDriverHandler,
    };
} 