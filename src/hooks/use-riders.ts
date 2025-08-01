/**
 * Hook for rider-related operations.
 */

import { useCallback } from 'react';
import { addRider, removeRider, createRequest } from '../services/api-client';
import { RideRequest } from '../types/simulation';

export function useRiders() {
    /**
     * Add a new rider to the simulation.
     */
    const addRiderHandler = useCallback(async (
        pickupX: number,
        pickupY: number,
        dropoffX: number,
        dropoffY: number
    ) => {
        try {
            console.log('Adding rider with pickup:', pickupX, pickupY, 'dropoff:', dropoffX, dropoffY);
            const rider = await addRider(pickupX, pickupY, dropoffX, dropoffY);
            console.log('Rider added:', rider);
            return rider;
        } catch (error) {
            console.error('Failed to add rider:', error);
            throw error;
        }
    }, []);

    /**
     * Remove a rider from the simulation.
     */
    const removeRiderHandler = useCallback(async (riderId: string) => {
        try {
            console.log('Removing rider:', riderId);
            const success = await removeRider(riderId);
            console.log('Rider removed:', success);
            return success;
        } catch (error) {
            console.error('Failed to remove rider:', error);
            throw error;
        }
    }, []);

    /**
     * Create a ride request for a rider.
     */
    const requestRideHandler = useCallback(async (riderId: string): Promise<RideRequest | null> => {
        try {
            console.log('Creating ride request for rider:', riderId);
            const request = await createRequest(riderId);
            console.log('Ride request created:', request);
            return request;
        } catch (error) {
            console.error('Failed to create ride request:', error);
            return null;
        }
    }, []);

    return {
        addRider: addRiderHandler,
        removeRider: removeRiderHandler,
        requestRide: requestRideHandler,
    };
} 