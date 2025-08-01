// Domain models for the ride-hailing simulation

export interface Driver {
  id: string;
  x: number;
  y: number;
  status: string;
  assignedRequestId?: string;
  tripPhase?: 'to_pickup' | 'to_dropoff';
  targetX?: number;
  targetY?: number;
  totalTrips: number;
  idleTicks: number;
}

export interface Rider {
  id: string;
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
}

export interface RideRequest {
  id: string;
  rider_id: string;
  status: string;
  assigned_driver_id?: string;
  created_at: Date;
  updated_at: Date;
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
}

export interface SimulationConfig {
  gridWidth: number;
  gridHeight: number;
  driverSpeed: number;
  tickInterval: number;
}

export interface SimulationStats {
  totalRequests: number;
  completedRides: number;
  failedRides: number;
  averageETA: number;
  activeDrivers: number;
  totalDrivers: number;
}

export interface SimulationState {
  drivers: Driver[];
  riders: Rider[];
  requests: RideRequest[];
  config: SimulationConfig;
  stats: SimulationStats;
}

export interface AddDriverRequest {
  x: number;
  y: number;
}

export interface AddRiderRequest {
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
}