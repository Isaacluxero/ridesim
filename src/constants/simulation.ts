/** Simulation configuration constants */

export const SIMULATION_CONFIG = {
    DEFAULT_GRID_WIDTH: 20,
    DEFAULT_GRID_HEIGHT: 20,
    CELL_SIZE: 25,
    API_BASE_URL: 'http://localhost:8000/api',
    TICK_INTERVAL: 1000,
} as const;

export const API_ENDPOINTS = {
    SIMULATION_STATE: '/simulation/state',
    SIMULATION_QUEUE: '/simulation/queue',
    ADD_DRIVER: '/simulation/drivers',
    REMOVE_DRIVER: (id: string) => `/simulation/drivers/${id}`,
    ADD_RIDER: '/simulation/riders',
    REMOVE_RIDER: (id: string) => `/simulation/riders/${id}`,
    REQUEST_RIDE: (riderId: string) => `/simulation/riders/${riderId}/request`,
    ADVANCE_TICK: '/simulation/tick',
    RESET_SIMULATION: '/simulation/reset',
    GET_STATS: '/simulation/stats',
    GET_CONFIG: '/simulation/config',
    UPDATE_CONFIG: '/simulation/config',
    INITIALIZE: '/simulation/initialize',
} as const;

export const UI_CONSTANTS = {
    TOOLTIP_OFFSET: 10,
    GRID_PADDING: 20,
    ICON_SIZE: 20,
    ANIMATION_DURATION: 300,
} as const;

export const STATUS_COLORS = {
    available: 'bg-green-500',
    on_trip: 'bg-blue-500',
    offline: 'bg-gray-500',
    waiting: 'bg-yellow-500',
    assigned: 'bg-blue-500',
    completed: 'bg-green-500',
} as const;

export const STATUS_LABELS = {
    available: 'Available',
    on_trip: 'On Trip',
    offline: 'Offline',
    waiting: 'Waiting',
    assigned: 'Assigned',
    completed: 'Completed',
} as const; 