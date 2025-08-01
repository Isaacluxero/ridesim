# Ride-Hailing Simulation System

A real-time ride-hailing simulation with a Python FastAPI backend and React TypeScript frontend. The system simulates drivers, riders, and ride requests on a grid-based city with intelligent dispatch logic.

## 🎮 Demo

Watch the ride-hailing simulation in action:

https://youtu.be/uA3MFWqiwGc

*The simulation demonstrates intelligent driver assignment, real-time movement, and the queue system ensuring no riders are ever rejected.*

## 🚀 Features

- **Real-time Simulation**: Tick-based advancement with live updates
- **Intelligent Dispatch**: Multi-factor scoring algorithm for optimal driver-rider assignments
- **Queue System**: No riders are ever rejected - they wait in queue until drivers become available
- **Visual Interface**: Interactive grid showing drivers, riders, and trip progress
- **Sequential Naming**: Clear "Driver 1", "Rider 2" identification system
- **Comprehensive Statistics**: Real-time metrics and queue monitoring

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Service-Oriented Design**: Separate services for drivers, riders, requests, queue, and scoring
- **Simulation Engine**: Central orchestrator managing all simulation logic
- **RESTful API**: Clean endpoints for all operations
- **In-Memory Storage**: Fast, no database required

### Frontend (React/TypeScript)
- **Custom Hooks**: Modular state management
- **Real-time Polling**: Automatic UI updates
- **Error Handling**: Graceful error boundaries and retry logic
- **Type Safety**: Full TypeScript implementation

## 🧠 Driver Pickup Logic

The system uses a sophisticated multi-factor scoring algorithm to determine the best driver for each rider:

### Scoring Formula
```
Score = ETA + Fairness_Bonus - Idle_Time_Bonus
```

**Components:**
- **ETA**: Manhattan distance to pickup location (realistic grid navigation)
- **Fairness Bonus**: Drivers with fewer total trips get priority (prevents overwork)
- **Idle Time Bonus**: Drivers who have been waiting longer get priority

### Trip Phases
1. **to_pickup**: Driver moves to rider's pickup location
2. **to_dropoff**: Driver moves to rider's dropoff location
3. **completed**: Trip finished, driver becomes available

### Queue System
- Riders are never rejected - they wait in a FIFO queue
- When drivers become available, queue is processed automatically
- Scoring algorithm ensures optimal assignments from available drivers

## 🎯 Key Assumptions

### Grid & Movement
- **Grid Size**: 20×20 cells (configurable, optimized for visualization)
- **Movement**: Manhattan distance (L1 norm) for realistic city navigation
- **Speed**: 1 unit per tick for all drivers
- **Boundaries**: Drivers and riders cannot move outside grid bounds

### Driver Behavior
- **Sequential IDs**: "Driver 1", "Driver 2" for clear identification
- **No Rejection**: Drivers automatically accept assignments (queue handles overflow)
- **Idle Tracking**: System tracks how long drivers have been waiting
- **Trip Counting**: Total trips completed affects fairness scoring

### Rider Behavior
- **Sequential IDs**: "Rider 1", "Rider 2" for clear identification
- **Immediate Requests**: Ride requests created automatically when riders are added
- **Queue Priority**: First-in-first-out queue ensures fair waiting order
- **Auto-Removal**: Riders are removed after trip completion

### Simulation Logic
- **Tick-Based**: Discrete time units for predictable advancement
- **Synchronous Movement**: All drivers move simultaneously each tick
- **In-Memory State**: No persistence between sessions
- **Real-time Updates**: Frontend polls backend every second when enabled

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip3 install -r requirements.txt
python3 main.py
```
Backend runs on `http://localhost:8000`

### Frontend Setup
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📊 API Endpoints

### Simulation Control
- `GET /api/simulation/state` - Get current simulation state
- `POST /api/simulation/tick` - Advance simulation by one tick
- `POST /api/simulation/reset` - Reset simulation to initial state
- `GET /api/simulation/stats` - Get simulation statistics
- `GET /api/simulation/queue` - Get queue information

### Driver Management
- `POST /api/simulation/drivers` - Add a new driver
- `DELETE /api/simulation/drivers/{id}` - Remove a driver

### Rider Management
- `POST /api/simulation/riders` - Add a new rider
- `DELETE /api/simulation/riders/{id}` - Remove a rider
- `POST /api/simulation/riders/{id}/request` - Create ride request

## 🎮 Usage

1. **Add Drivers**: Click "Add Driver" to place drivers on the grid
2. **Add Riders**: Click "Add Rider" to create riders with pickup/dropoff locations
3. **Advance Time**: Click "Next Tick" to move simulation forward
4. **Monitor**: Watch drivers move to pickup riders and complete trips
5. **Queue**: See waiting riders in the queue status panel

## 🔧 Configuration

### Backend Configuration (`backend/config.py`)
- Grid dimensions
- API host/port
- Scoring algorithm parameters
- CORS origins

### Frontend Configuration (`src/constants/simulation.ts`)
- API endpoints
- UI constants
- Status colors and labels

