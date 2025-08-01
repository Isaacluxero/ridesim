/**
 * Utility functions for simulation operations.
 */

import { Driver, Rider, RideRequest } from '../types/simulation';
import { STATUS_COLORS, STATUS_LABELS, SIMULATION_CONFIG } from '../constants/simulation';

/**
 * Validate if a position is within the grid boundaries.
 */
export function isValidPosition(
    x: number,
    y: number,
    gridWidth: number = 20,
    gridHeight: number = 20
): boolean {
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
}

/**
 * Calculate Manhattan distance between two points.
 */
export function calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Calculate ETA between two points using Manhattan distance.
 */
export function calculateETA(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    speed: number = 1
): number {
    const distance = calculateDistance(fromX, fromY, toX, toY);
    return Math.ceil(distance / speed);
}

/**
 * Get the CSS class for a status color.
 */
export function getStatusColor(status: string): string {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-500';
}

/**
 * Get the display label for a status.
 */
export function getStatusLabel(status: string): string {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || 'Unknown';
}

/**
 * Format a driver or rider ID for display.
 */
export function formatId(id: string): string {
    const match = id.match(/(\d+)$/);
    return match ? match[1] : id;
}

/**
 * Get the full display name for a driver or rider.
 */
export function getDisplayName(id: string): string {
    return id;
}

/**
 * Filter drivers by status.
 */
export function filterDriversByStatus(drivers: Driver[], status: string): Driver[] {
    return drivers.filter(driver => driver.status === status);
}

/**
 * Get grid dimensions for rendering.
 */
export function getGridDimensions(
    gridWidth: number = 20,
    gridHeight: number = 20,
    cellSize: number = SIMULATION_CONFIG.CELL_SIZE
) {
    return {
        width: gridWidth * cellSize,
        height: gridHeight * cellSize,
    };
}

/**
 * Generate a random position within the grid bounds.
 */
export function generateRandomPosition(
    gridWidth: number = 20,
    gridHeight: number = 20
): { x: number; y: number } {
    return {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
    };
}

/**
 * Check if a driver is currently on a trip.
 */
export function isDriverOnTrip(driver: Driver): boolean {
    return driver.status === 'on_trip' && driver.assignedRequestId !== null;
}

/**
 * Get the current target position for a driver.
 */
export function getDriverTarget(driver: Driver): { x: number; y: number } | null {
    if (driver.targetX === null || driver.targetY === null) {
        return null;
    }
    return { x: driver.targetX, y: driver.targetY };
} 