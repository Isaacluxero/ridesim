from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import random

from models import (
    Driver, Rider, RideRequest, SimulationConfig, SimulationStats,
    AddDriverRequest, AddRiderRequest, SimulationState
)
from simulation_engine import SimulationEngine
from exceptions import (
    DriverNotFoundError, RiderNotFoundError, PositionOutOfBoundsError,
    NoAvailableDriversError, InvalidRequestError
)
from config import CORS_ORIGINS, API_HOST, API_PORT

app = FastAPI(title="Ride Simulation API", version="1.0.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation engine instance
simulation_engine = SimulationEngine()

@app.get("/")
async def root():
    return {"message": "Ride Simulation API"}

@app.get("/api/simulation/state")
async def get_simulation_state() -> SimulationState:
    """Get the current simulation state"""
    return SimulationState(
        drivers=simulation_engine.list_drivers(),
        riders=simulation_engine.list_riders(),
        requests=simulation_engine.list_requests(),
        config=simulation_engine.config,
        stats=simulation_engine.get_stats()
    )

@app.get("/api/simulation/queue")
async def get_queue_info():
    """Get information about the current queue"""
    return simulation_engine.get_queue_info()

@app.post("/api/simulation/drivers")
async def add_driver(request: AddDriverRequest) -> Driver:
    """Add a new driver to the simulation"""
    try:
        driver = simulation_engine.add_driver(request.x, request.y)
        return driver
    except PositionOutOfBoundsError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/simulation/drivers/{driver_id}")
async def remove_driver(driver_id: str) -> dict:
    """Remove a driver from the simulation"""
    success = simulation_engine.remove_driver(driver_id)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"success": True}

@app.post("/api/simulation/riders")
async def add_rider(request: AddRiderRequest) -> dict:
    """Add a new rider to the simulation"""
    try:
        rider, ride_request = simulation_engine.add_rider(
            request.pickup_x, request.pickup_y, 
            request.dropoff_x, request.dropoff_y
        )
        
        return {
            "rider": rider,
            "request": ride_request
        }
    except PositionOutOfBoundsError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/simulation/riders/{rider_id}")
async def remove_rider(rider_id: str) -> dict:
    """Remove a rider from the simulation"""
    success = simulation_engine.remove_rider(rider_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rider not found")
    return {"success": True}

@app.post("/api/simulation/riders/{rider_id}/request")
async def request_ride(rider_id: str) -> RideRequest:
    """Create a ride request for a specific rider"""
    ride_request = simulation_engine.create_request(rider_id)
    if not ride_request:
        raise HTTPException(status_code=404, detail="Rider not found")
    return ride_request

@app.post("/api/simulation/tick")
async def advance_tick() -> dict:
    """Advance the simulation by one tick"""
    simulation_engine.advance_tick()
    return {"success": True}

@app.post("/api/simulation/reset")
async def reset_simulation() -> dict:
    """Reset the simulation to initial state"""
    simulation_engine.reset()
    return {"success": True}

@app.get("/api/simulation/stats")
async def get_stats() -> SimulationStats:
    """Get simulation statistics"""
    return simulation_engine.get_stats()

@app.get("/api/simulation/config")
async def get_config() -> SimulationConfig:
    """Get simulation configuration"""
    return simulation_engine.config

@app.put("/api/simulation/config")
async def update_config(config: SimulationConfig) -> SimulationConfig:
    """Update simulation configuration"""
    simulation_engine.config = config
    return simulation_engine.config

@app.post("/api/simulation/initialize")
async def initialize_simulation() -> dict:
    """Initialize the simulation with sample data"""
    simulation_engine.reset()
    
    # Add some initial drivers
    simulation_engine.add_driver(2, 2)
    simulation_engine.add_driver(15, 8)
    simulation_engine.add_driver(8, 15)
    
    return {"success": True, "message": "Simulation initialized with sample data"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT) 