from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from config import DEFAULT_GRID_WIDTH, DEFAULT_GRID_HEIGHT, DEFAULT_DRIVER_SPEED, DEFAULT_TICK_INTERVAL

class DriverStatus(str, Enum):
    available = "available"
    on_trip = "on_trip"
    offline = "offline"

class RideRequestStatus(str, Enum):
    waiting = "waiting"
    assigned = "assigned"
    completed = "completed"
    failed = "failed"

class TripPhase(str, Enum):
    to_pickup = "to_pickup"
    to_dropoff = "to_dropoff"

class Position(BaseModel):
    x: int
    y: int
    
    @validator('x', 'y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class Driver(BaseModel):
    id: str
    x: int
    y: int
    status: DriverStatus
    totalTrips: int = 0
    idleTicks: int = 0
    assignedRequestId: Optional[str] = None
    tripPhase: Optional[TripPhase] = None
    targetX: Optional[int] = None
    targetY: Optional[int] = None
    
    @validator('x', 'y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class Rider(BaseModel):
    id: str
    pickup_x: int
    pickup_y: int
    dropoff_x: int
    dropoff_y: int
    
    @validator('pickup_x', 'pickup_y', 'dropoff_x', 'dropoff_y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class RideRequest(BaseModel):
    id: str
    rider_id: str
    status: RideRequestStatus
    created_at: datetime
    updated_at: datetime
    pickup_x: int
    pickup_y: int
    dropoff_x: int
    dropoff_y: int
    assigned_driver_id: Optional[str] = None
    
    @validator('pickup_x', 'pickup_y', 'dropoff_x', 'dropoff_y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class SimulationConfig(BaseModel):
    gridWidth: int = DEFAULT_GRID_WIDTH
    gridHeight: int = DEFAULT_GRID_HEIGHT
    driverSpeed: int = DEFAULT_DRIVER_SPEED
    tickInterval: int = DEFAULT_TICK_INTERVAL
    
    @validator('gridWidth', 'gridHeight', 'driverSpeed', 'tickInterval')
    def validate_positive(cls, v):
        if v <= 0:
            raise ValueError('Configuration values must be positive')
        return v

class SimulationStats(BaseModel):
    totalRequests: int
    completedRides: int
    failedRides: int
    averageETA: int
    activeDrivers: int
    totalDrivers: int

class AddDriverRequest(BaseModel):
    x: int
    y: int
    
    @validator('x', 'y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class AddRiderRequest(BaseModel):
    pickup_x: int
    pickup_y: int
    dropoff_x: int
    dropoff_y: int
    
    @validator('pickup_x', 'pickup_y', 'dropoff_x', 'dropoff_y')
    def validate_position(cls, v):
        if v < 0:
            raise ValueError('Position coordinates must be non-negative')
        return v

class SimulationState(BaseModel):
    drivers: List[Driver]
    riders: List[Rider]
    requests: List[RideRequest]
    config: SimulationConfig
    stats: SimulationStats 