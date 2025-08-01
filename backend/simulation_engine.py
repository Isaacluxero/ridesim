"""Main simulation engine that orchestrates all services.

This module contains the SimulationEngine class which serves as the central orchestrator
for the ride-hailing simulation. It coordinates between different services (drivers, riders,
requests, queue) and manages the overall simulation state.

The engine implements a tick-based simulation where:
- Each tick advances the simulation by one time unit
- Drivers move towards their targets (pickup/dropoff locations)
- The queue system processes waiting riders when drivers become available
- The scoring algorithm determines optimal driver-rider assignments

Key Components:
- Driver Management: Adding, removing, and tracking driver states
- Rider Management: Creating riders and their associated ride requests
- Queue System: FIFO queue for riders when no drivers are available
- Trip Phases: to_pickup -> to_dropoff -> completed
- Scoring Algorithm: Determines best driver for each rider based on distance, fairness, and idle time
"""

from typing import List, Optional, Tuple
from datetime import datetime
from models import Driver, Rider, RideRequest, SimulationConfig, SimulationStats
from services.driver_service import DriverService
from services.rider_service import RiderService
from services.request_service import RequestService
from services.queue_service import QueueService
from services.scoring_service import ScoringService
from exceptions import NoAvailableDriversError
from config import DEFAULT_GRID_WIDTH, DEFAULT_GRID_HEIGHT, DEFAULT_DRIVER_SPEED, DEFAULT_TICK_INTERVAL


class SimulationEngine:
    """Main simulation engine that orchestrates all services.
    
    The SimulationEngine serves as the central coordinator for the ride-hailing simulation.
    It manages the interaction between different services and maintains the overall
    simulation state. The engine implements a tick-based system where each tick
    represents one time unit in the simulation.
    
    Key Responsibilities:
    - Coordinate between driver, rider, request, and queue services
    - Manage simulation state and configuration
    - Handle tick advancement and driver movement
    - Process the queue system for waiting riders
    - Maintain simulation statistics
    """
    
    def __init__(self):
        """Initialize the simulation engine with all required services.
        
        Creates instances of all service classes and initializes the simulation
        with default configuration values. The engine maintains references to
        all services for coordinated operations.
        """
        self.driver_service = DriverService()
        self.rider_service = RiderService()
        self.request_service = RequestService()
        self.queue_service = QueueService()
        self.scoring_service = ScoringService()
        self.config = SimulationConfig(
            gridWidth=DEFAULT_GRID_WIDTH,
            gridHeight=DEFAULT_GRID_HEIGHT,
            driverSpeed=DEFAULT_DRIVER_SPEED,
            tickInterval=DEFAULT_TICK_INTERVAL
        )
    
    # Driver operations
    def add_driver(self, x: int, y: int) -> Driver:
        """Add a new driver to the simulation.
        
        Creates a new driver at the specified position and immediately processes
        the queue to see if any waiting riders can be assigned to the new driver.
        
        Args:
            x: X-coordinate for the driver's initial position (0 to gridWidth-1)
            y: Y-coordinate for the driver's initial position (0 to gridHeight-1)
            
        Returns:
            Driver: The newly created driver object
            
        Raises:
            PositionOutOfBoundsError: If the specified position is outside the grid bounds
        """
        driver = self.driver_service.add_driver(x, y)
        # Process queue when a new driver is added - this ensures waiting riders
        # get assigned immediately if the new driver is the best match
        self._process_queue()
        return driver
    
    def remove_driver(self, driver_id: str) -> bool:
        """Remove a driver from the simulation.
        
        Removes the specified driver and any associated requests. If the driver
        was currently on a trip, the associated rider and request are also removed.
        
        Args:
            driver_id: The unique identifier of the driver to remove
            
        Returns:
            bool: True if driver was successfully removed, False if driver not found
        """
        return self.driver_service.remove_driver(driver_id)
    
    def get_driver(self, driver_id: str) -> Optional[Driver]:
        """Get a driver by ID.
        
        Args:
            driver_id: The unique identifier of the driver
            
        Returns:
            Optional[Driver]: The driver object if found, None otherwise
        """
        return self.driver_service.get_driver(driver_id)
    
    def list_drivers(self) -> List[Driver]:
        """Get all drivers in the simulation.
        
        Returns:
            List[Driver]: List of all driver objects currently in the simulation
        """
        return self.driver_service.list_drivers()
    
    # Rider operations
    def add_rider(self, pickup_x: int, pickup_y: int, dropoff_x: int, dropoff_y: int) -> Tuple[Rider, RideRequest]:
        """Add a new rider and create a ride request.
        
        Creates a new rider with the specified pickup and dropoff locations,
        then immediately creates a ride request for that rider. The request
        is either assigned to an available driver or added to the queue.
        
        Args:
            pickup_x: X-coordinate of pickup location
            pickup_y: Y-coordinate of pickup location
            dropoff_x: X-coordinate of dropoff location
            dropoff_y: Y-coordinate of dropoff location
            
        Returns:
            Tuple[Rider, RideRequest]: The created rider and their associated ride request
            
        Raises:
            PositionOutOfBoundsError: If any coordinates are outside the grid bounds
        """
        rider = self.rider_service.add_rider(pickup_x, pickup_y, dropoff_x, dropoff_y)
        request = self.request_service.create_request(rider)
        
        # Try to assign immediately, otherwise add to queue
        # This ensures riders get the best available driver or wait in queue
        if not self._try_assign_request(request):
            self.queue_service.add_to_queue(request)
        
        return rider, request
    
    def remove_rider(self, rider_id: str) -> bool:
        """Remove a rider and their associated requests.
        
        Removes the specified rider and any associated ride requests from both
        the request service and the queue system.
        
        Args:
            rider_id: The unique identifier of the rider to remove
            
        Returns:
            bool: True if rider was successfully removed, False if rider not found
        """
        # Remove requests for this rider
        self.request_service.remove_requests_for_rider(rider_id)
        # Remove from queue
        for request in self.queue_service.get_queued_requests():
            if request.rider_id == rider_id:
                self.queue_service.remove_from_queue(request)
        return self.rider_service.remove_rider(rider_id)
    
    def get_rider(self, rider_id: str) -> Optional[Rider]:
        """Get a rider by ID.
        
        Args:
            rider_id: The unique identifier of the rider
            
        Returns:
            Optional[Rider]: The rider object if found, None otherwise
        """
        return self.rider_service.get_rider(rider_id)
    
    def list_riders(self) -> List[Rider]:
        """Get all riders in the simulation.
        
        Returns:
            List[Rider]: List of all rider objects currently in the simulation
        """
        return self.rider_service.list_riders()
    
    # Request operations
    def create_request(self, rider_id: str) -> Optional[RideRequest]:
        """Create a ride request for a specific rider.
        
        Creates a new ride request for the specified rider. The request is
        either assigned to an available driver or added to the queue.
        
        Args:
            rider_id: The unique identifier of the rider
            
        Returns:
            Optional[RideRequest]: The created ride request, or None if rider not found
        """
        rider = self.get_rider(rider_id)
        if not rider:
            return None
        
        request = self.request_service.create_request(rider)
        
        # Try to assign immediately, otherwise add to queue
        if not self._try_assign_request(request):
            self.queue_service.add_to_queue(request)
        
        return request
    
    def get_request(self, request_id: str) -> Optional[RideRequest]:
        """Get a request by ID.
        
        Args:
            request_id: The unique identifier of the request
            
        Returns:
            Optional[RideRequest]: The request object if found, None otherwise
        """
        return self.request_service.get_request(request_id)
    
    def list_requests(self) -> List[RideRequest]:
        """Get all requests in the simulation.
        
        Returns:
            List[RideRequest]: List of all ride request objects currently in the simulation
        """
        return self.request_service.list_requests()
    
    # Simulation operations
    def advance_tick(self) -> None:
        """Advance the simulation by one tick.
        
        This is the core simulation loop that:
        1. Moves all busy drivers one step towards their targets
        2. Increments idle time for available drivers
        3. Processes the queue to assign waiting riders to newly available drivers
        
        The tick system ensures that the simulation progresses in discrete time units,
        making it predictable and suitable for real-time visualization.
        """
        print(f"Advancing tick - {len(self.driver_service.get_busy_drivers())} busy drivers")
        
        # Move busy drivers - each driver moves one step towards their target
        # This includes drivers going to pickup and drivers going to dropoff
        for driver in self.driver_service.get_busy_drivers():
            print(f"Moving driver {driver.id} from ({driver.x}, {driver.y}) to target ({driver.targetX}, {driver.targetY})")
            self._move_driver_one_step(driver)
        
        # Increment idle ticks for available drivers - this affects the scoring algorithm
        # Drivers who have been idle longer get priority in assignments
        for driver in self.driver_service.get_available_drivers():
            self.driver_service.increment_idle_ticks(driver)
        
        # Process queue after driver movements - newly available drivers can now
        # be assigned to waiting riders in the queue
        self._process_queue()
    
    def reset(self) -> None:
        """Reset the simulation to initial state.
        
        Clears all drivers, riders, requests, and the queue. This effectively
        restarts the simulation with a clean slate.
        """
        self.driver_service.clear_drivers()
        self.rider_service.clear_riders()
        self.request_service.clear_requests()
        self.queue_service.clear_queue()
    
    def get_stats(self) -> SimulationStats:
        """Get simulation statistics.
        
        Calculates and returns comprehensive statistics about the current
        simulation state including total requests, completed rides, and driver counts.
        
        Returns:
            SimulationStats: Object containing all simulation statistics
        """
        requests = self.list_requests()
        drivers = self.list_drivers()
        
        return SimulationStats(
            totalRequests=len(requests),
            completedRides=len(self.request_service.get_completed_requests()),
            failedRides=0,  # No failed rides with queue system - riders wait instead
            averageETA=0,  # Could calculate this based on distance and speed
            activeDrivers=len([d for d in drivers if d.status != "offline"]),
            totalDrivers=len(drivers)
        )
    
    def get_queue_info(self) -> dict:
        """Get information about the current queue.
        
        Returns detailed information about the queue system including
        queue length, waiting requests, and available drivers.
        
        Returns:
            dict: Dictionary containing queue statistics and details
        """
        waiting_requests = self.request_service.get_waiting_requests()
        available_drivers = self.driver_service.get_available_drivers()
        
        return {
            "queue_length": self.queue_service.get_queue_length(),
            "waiting_requests": len(waiting_requests),
            "available_drivers": len(available_drivers),
            "queue_requests": [
                {
                    "id": req.id,
                    "rider_id": req.rider_id,
                    "status": req.status,
                    "created_at": req.created_at.isoformat()
                } for req in self.queue_service.get_queued_requests()
            ],
            "available_driver_ids": [d.id for d in available_drivers]
        }
    
    # Private methods
    def _try_assign_request(self, request: RideRequest) -> bool:
        """Try to assign a request to an available driver.
        
        Uses the scoring algorithm to find the best available driver for the request.
        If a suitable driver is found, the request is assigned immediately.
        
        Args:
            request: The ride request to assign
            
        Returns:
            bool: True if request was successfully assigned, False if no suitable driver found
        """
        available_drivers = self.driver_service.get_available_drivers()
        
        if not available_drivers:
            return False
        
        try:
            # Use scoring algorithm to find the best driver for this request
            best_driver = self.scoring_service.find_best_driver(available_drivers, request)
            self._assign_request_to_driver(request, best_driver)
            return True
        except ValueError:
            return False
    
    def _assign_request_to_driver(self, request: RideRequest, driver: Driver) -> None:
        """Assign a request to a driver.
        
        Updates both the request and driver objects to establish the assignment.
        The driver's status changes to 'on_trip' and they are given the pickup
        location as their target.
        
        Args:
            request: The ride request to assign
            driver: The driver to assign the request to
        """
        self.request_service.assign_request(request, driver)
        
        # Update driver state for the new assignment
        driver.status = "on_trip"
        driver.assignedRequestId = request.id
        driver.tripPhase = "to_pickup"  # First phase: go to pickup location
        driver.targetX = request.pickup_x
        driver.targetY = request.pickup_y
        driver.idleTicks = 0  # Reset idle time since driver is now busy
    
    def _process_queue(self) -> None:
        """Process the queue of waiting requests.
        
        Iterates through the queue and attempts to assign waiting riders to
        newly available drivers. Uses the scoring algorithm to find optimal
        assignments. This is called after driver movements to ensure waiting
        riders get assigned as soon as drivers become available.
        """
        available_drivers = self.driver_service.get_available_drivers()
        processed_requests = self.queue_service.process_queue(available_drivers)
        
        # Update request service with processed requests
        for request in processed_requests:
            self.request_service.assign_request(request, request.assigned_driver_id)
    
    def _move_driver_one_step(self, driver: Driver) -> None:
        """Move a driver one step towards their target.
        
        This is the core movement logic that:
        1. Moves the driver one step towards their current target
        2. Checks if the driver has reached their target
        3. Updates the trip phase when targets are reached
        4. Completes trips when drivers reach dropoff locations
        
        Trip Phases:
        - to_pickup: Driver is moving to pickup location
        - to_dropoff: Driver has picked up rider and is moving to dropoff location
        
        Args:
            driver: The driver to move
        """
        # Move the driver one step towards their target using the driver service
        self.driver_service.move_driver_one_step(driver)
        
        # Check if driver reached target - this determines phase transitions
        if (driver.targetX is not None and driver.targetY is not None and 
            driver.x == driver.targetX and driver.y == driver.targetY):
            request = self.get_request(driver.assignedRequestId)
            if not request:
                print(f"Warning: Driver {driver.id} reached target but no request found")
                return
            
            print(f"Driver {driver.id} reached target at ({driver.x}, {driver.y})")
            print(f"Current trip phase: {driver.tripPhase}")
            
            if driver.tripPhase == "to_pickup":
                # Driver reached pickup location - now go to dropoff
                print(f"Driver {driver.id} picked up rider, now going to dropoff at ({request.dropoff_x}, {request.dropoff_y})")
                driver.tripPhase = "to_dropoff"
                driver.targetX = request.dropoff_x
                driver.targetY = request.dropoff_y
            elif driver.tripPhase == "to_dropoff":
                # Driver reached dropoff location - trip is complete
                print(f"Driver {driver.id} completed trip")
                self._complete_trip(driver, request)
    
    def _complete_trip(self, driver: Driver, request: RideRequest) -> None:
        """Complete a trip.
        
        Marks the trip as completed and updates all related objects:
        - Request status becomes 'completed'
        - Driver becomes available again
        - Rider is removed from the simulation
        - Queue is processed to assign waiting riders to the newly available driver
        
        Args:
            driver: The driver who completed the trip
            request: The ride request that was completed
        """
        self.request_service.complete_request(request)
        self.driver_service.complete_trip(driver)
        self.remove_rider(request.rider_id)
        
        # Process queue since a driver became available
        # This ensures waiting riders get assigned to the newly available driver
        self._process_queue() 