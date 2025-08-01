/**
 * API Client for communicating with the Python FastAPI backend.
 * 
 * This module provides a centralized interface for all frontend-backend communication.
 * It handles HTTP requests, error handling, retry logic, and data transformation.
 * 
 * Key Features:
 * - Centralized API endpoint management
 * - Automatic error handling and retry logic with exponential backoff
 * - Request/response logging for debugging
 * - Type-safe API calls with TypeScript interfaces
 * - Consistent error handling across all endpoints
 * 
 * The client implements a robust communication layer that ensures:
 * 1. Reliable communication with the backend
 * 2. Graceful handling of network errors
 * 3. Automatic retries for transient failures
 * 4. Detailed logging for debugging and monitoring
 */

import {
    SimulationState,
    Driver,
    Rider,
    RideRequest,
    AddDriverRequest,
    AddRiderRequest,
    SimulationStats
} from '../types/simulation';
import { API_ENDPOINTS, SIMULATION_CONFIG } from '../constants/simulation';

/**
 * Custom error class for API-related errors.
 * 
 * Provides detailed error information including the HTTP status code,
 * error message, and the original request details for debugging.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Generic request method with retry logic and error handling.
 * 
 * This is the core HTTP client that handles all API communication.
 * It implements exponential backoff retry logic and comprehensive
 * error handling for robust frontend-backend communication.
 * 
 * Retry Logic:
 * - Attempts up to 3 total requests (1 initial + 2 retries)
 * - Exponential backoff: 100ms, 200ms delays between retries
 * - Only retries on network errors, not HTTP error responses
 * 
 * Error Handling:
 * - Network errors trigger retries with exponential backoff
 * - HTTP errors (4xx, 5xx) are converted to ApiError instances
 * - Detailed logging for debugging and monitoring
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise with the parsed JSON response
 * @throws ApiError for HTTP errors, Error for network failures
 */
async function request<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Construct full URL with base URL
            const fullUrl = `${SIMULATION_CONFIG.API_BASE_URL}${url}`;
            console.log(`API Request (attempt ${attempt + 1}): ${options.method || 'GET'} ${fullUrl}`);

            const response = await fetch(fullUrl, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            console.log(`API Response: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                // HTTP error - don't retry, throw ApiError
                const errorText = await response.text();
                throw new ApiError(
                    response.status,
                    `HTTP ${response.status}: ${errorText || response.statusText}`
                );
            }

            const data = await response.json();
            console.log(`API Response Data:`, data);
            return data;

        } catch (error) {
            lastError = error as Error;

            // Don't retry on HTTP errors (ApiError), only on network errors
            if (error instanceof ApiError) {
                throw error;
            }

            // Network error - retry with exponential backoff
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms
                console.log(`Network error, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries exhausted
    throw new ApiError(
        0,
        `Request failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
        lastError || undefined
    );
}

/**
 * Get the current simulation state from the backend.
 * 
 * Fetches the complete simulation state including all drivers, riders,
 * requests, and statistics. This is the primary method for keeping
 * the frontend synchronized with the backend state.
 * 
 * The response includes:
 * - All active drivers with their current positions and status
 * - All riders with their pickup/dropoff locations
 * - All ride requests with their current status
 * - Simulation statistics and queue information
 * 
 * @returns Promise with the complete simulation state
 * @throws ApiError if the request fails
 */
export async function getSimulationState(): Promise<SimulationState> {
    return request<SimulationState>(API_ENDPOINTS.SIMULATION_STATE);
}

/**
 * Add a new driver to the simulation.
 * 
 * Creates a driver at the specified position and immediately processes
 * the queue to see if any waiting riders can be assigned to the new driver.
 * 
 * Driver Creation Process:
 * 1. Driver is created with sequential ID (Driver 1, Driver 2, etc.)
 * 2. Driver starts in 'available' status at the specified position
 * 3. Queue is processed to assign waiting riders to the new driver
 * 4. Driver becomes available for new assignments
 * 
 * @param x - X-coordinate for the driver's initial position
 * @param y - Y-coordinate for the driver's initial position
 * @returns Promise with the created driver object
 * @throws ApiError if coordinates are invalid or request fails
 */
export async function addDriver(x: number, y: number): Promise<Driver> {
    const requestData: AddDriverRequest = { x, y };
    return request<Driver>(API_ENDPOINTS.ADD_DRIVER, {
        method: 'POST',
        body: JSON.stringify(requestData),
    });
}

/**
 * Remove a driver from the simulation.
 * 
 * Removes the specified driver and any associated requests. If the driver
 * was currently on a trip, the associated rider and request are also removed.
 * 
 * @param driverId - The unique identifier of the driver to remove
 * @returns Promise with boolean indicating success
 * @throws ApiError if driver not found or request fails
 */
export async function removeDriver(driverId: string): Promise<boolean> {
    return request<boolean>(`${API_ENDPOINTS.REMOVE_DRIVER}/${driverId}`, {
        method: 'DELETE',
    });
}

/**
 * Add a new rider and create a ride request.
 * 
 * Creates a rider with the specified pickup and dropoff locations,
 * then immediately creates a ride request for that rider. The request
 * is either assigned to an available driver or added to the queue.
 * 
 * Rider Creation Process:
 * 1. Rider is created with sequential ID (Rider 1, Rider 2, etc.)
 * 2. Ride request is created for the rider
 * 3. Scoring algorithm determines best available driver
 * 4. If no driver available, rider is added to queue
 * 
 * @param pickupX - X-coordinate of pickup location
 * @param pickupY - Y-coordinate of pickup location
 * @param dropoffX - X-coordinate of dropoff location
 * @param dropoffY - Y-coordinate of dropoff location
 * @returns Promise with the created rider object
 * @throws ApiError if coordinates are invalid or request fails
 */
export async function addRider(
    pickupX: number,
    pickupY: number,
    dropoffX: number,
    dropoffY: number
): Promise<Rider> {
    const requestData: AddRiderRequest = {
        pickup_x: pickupX,
        pickup_y: pickupY,
        dropoff_x: dropoffX,
        dropoff_y: dropoffY,
    };
    return request<Rider>(API_ENDPOINTS.ADD_RIDER, {
        method: 'POST',
        body: JSON.stringify(requestData),
    });
}

/**
 * Remove a rider and their associated requests.
 * 
 * Removes the specified rider and any associated ride requests from both
 * the request service and the queue system.
 * 
 * @param riderId - The unique identifier of the rider to remove
 * @returns Promise with boolean indicating success
 * @throws ApiError if rider not found or request fails
 */
export async function removeRider(riderId: string): Promise<boolean> {
    return request<boolean>(`${API_ENDPOINTS.REMOVE_RIDER}/${riderId}`, {
        method: 'DELETE',
    });
}

/**
 * Create a ride request for a specific rider.
 * 
 * Creates a new ride request for the specified rider. The request is
 * either assigned to an available driver or added to the queue.
 * 
 * @param riderId - The unique identifier of the rider
 * @returns Promise with the created ride request, or null if rider not found
 * @throws ApiError if request fails
 */
export async function createRequest(riderId: string): Promise<RideRequest | null> {
    return request<RideRequest | null>(API_ENDPOINTS.REQUEST_RIDE(riderId), {
        method: 'POST',
    });
}

/**
 * Advance the simulation by one tick.
 * 
 * This is the core simulation advancement that:
 * 1. Moves all busy drivers one step towards their targets
 * 2. Increments idle time for available drivers
 * 3. Processes the queue to assign waiting riders to newly available drivers
 * 
 * The tick system ensures that the simulation progresses in discrete time units,
 * making it predictable and suitable for real-time visualization.
 * 
 * @returns Promise that resolves when the tick is complete
 * @throws ApiError if the tick advancement fails
 */
export async function advanceTick(): Promise<void> {
    return request<void>(API_ENDPOINTS.ADVANCE_TICK, {
        method: 'POST',
    });
}

/**
 * Reset the simulation to initial state.
 * 
 * Clears all drivers, riders, requests, and the queue. This effectively
 * restarts the simulation with a clean slate.
 * 
 * @returns Promise that resolves when the reset is complete
 * @throws ApiError if the reset operation fails
 */
export async function resetSimulation(): Promise<void> {
    return request<void>(API_ENDPOINTS.RESET_SIMULATION, {
        method: 'POST',
    });
}

/**
 * Initialize the simulation with sample data.
 * 
 * Resets the simulation and adds sample drivers to get started.
 * This is typically called when the application first loads.
 * 
 * @returns Promise that resolves when initialization is complete
 * @throws ApiError if the initialization fails
 */
export async function initializeSimulation(): Promise<void> {
    return request<void>(API_ENDPOINTS.INITIALIZE, {
        method: 'POST',
    });
}

/**
 * Get simulation statistics.
 * 
 * Retrieves comprehensive statistics about the current simulation state
 * including total requests, completed rides, and driver counts.
 * 
 * @returns Promise with simulation statistics
 * @throws ApiError if the request fails
 */
export async function getSimulationStats(): Promise<SimulationStats> {
    return request<SimulationStats>(API_ENDPOINTS.GET_STATS);
}

/**
 * Get information about the current queue.
 * 
 * Returns detailed information about the queue system including
 * queue length, waiting requests, and available drivers.
 * 
 * @returns Promise with queue information
 * @throws ApiError if the request fails
 */
export async function getQueueInfo(): Promise<any> {
    return request<any>(API_ENDPOINTS.SIMULATION_QUEUE);
} 