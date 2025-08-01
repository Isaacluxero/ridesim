# Ride Simulation Backend

A FastAPI-based backend for the ride simulation system with a clean, modular architecture and intelligent dispatch logic.

## Architecture

The backend follows a service-oriented architecture with clear separation of concerns:

### Core Components

- **`simulation_engine.py`**: Main orchestrator that coordinates all services
- **`services/`**: Individual service modules for specific functionality
  - `driver_service.py`: Driver management operations (add, remove, move, track)
  - `rider_service.py`: Rider management operations (add, remove)
  - `request_service.py`: Ride request operations (create, assign, complete)
  - `queue_service.py`: FIFO queue management for waiting requests
  - `scoring_service.py`: Multi-factor driver scoring and ETA calculations
- **`models.py`**: Pydantic models for data validation and type safety
- **`exceptions.py`**: Custom exception classes for error handling
- **`config.py`**: Configuration constants and settings
- **`main.py`**: FastAPI application and API endpoints

### Key Features

- **Service Layer**: Each domain has its own service with clear responsibilities
- **Error Handling**: Custom exceptions with proper HTTP status codes
- **Type Safety**: Full type hints and Pydantic validation
- **Configuration Management**: Centralized configuration with constants
- **Queue System**: FIFO queue for handling requests when no drivers are available
- **Intelligent Dispatch**: Multi-factor scoring algorithm for optimal driver assignments
- **Sequential ID Generation**: "Driver 1", "Rider 2" for clear identification

## API Endpoints

### Simulation Control
- `GET /api/simulation/state` - Get current simulation state (drivers, riders, requests, config, stats)
- `GET /api/simulation/queue` - Get queue information and waiting requests
- `POST /api/simulation/tick` - Advance simulation by one tick
- `POST /api/simulation/reset` - Reset simulation to initial state
- `GET /api/simulation/stats` - Get simulation statistics
- `POST /api/simulation/initialize` - Initialize with sample data (3 drivers)

### Driver Management
- `POST /api/simulation/drivers` - Add a new driver at specified coordinates
- `DELETE /api/simulation/drivers/{id}` - Remove a driver by ID

### Rider Management
- `POST /api/simulation/riders` - Add a new rider with pickup/dropoff locations
- `DELETE /api/simulation/riders/{id}` - Remove a rider by ID
- `POST /api/simulation/riders/{id}/request` - Create a ride request for a specific rider

### Configuration
- `GET /api/simulation/config` - Get current simulation configuration
- `PUT /api/simulation/config` - Update simulation configuration

## Running the Backend

1. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```

2. Start the server:
   ```bash
   python3 main.py
   ```

The server will start on `http://localhost:8000`

## Dispatch Logic

The backend implements a sophisticated multi-factor scoring algorithm:

### Scoring Formula
```
Score = ETA + Fairness_Bonus - Idle_Time_Bonus
```

**Components:**
- **ETA**: Manhattan distance to pickup location
- **Fairness Bonus**: Drivers with fewer total trips get priority
- **Idle Time Bonus**: Drivers who have been waiting longer get priority

### Queue System
- Riders are never rejected - they wait in a FIFO queue
- Queue is processed automatically when drivers become available
- Scoring algorithm ensures optimal assignments from available drivers

### Trip Phases
1. **to_pickup**: Driver moves to rider's pickup location
2. **to_dropoff**: Driver moves to rider's dropoff location
3. **completed**: Trip finished, driver becomes available
