"""Service for managing drivers in the simulation.

This module contains the DriverService class which handles all driver-related operations
including creation, movement, state management, and trip completion.

The driver service manages:
- Driver creation with sequential IDs (Driver 1, Driver 2, etc.)
- Driver movement logic with target-based navigation
- Driver state transitions (available -> on_trip -> available)
- Trip phase management (to_pickup -> to_dropoff -> completed)
- Idle time tracking for scoring algorithm

Key Features:
- Sequential ID generation for consistent naming
- Manhattan distance-based movement
- State management for driver availability
- Integration with scoring and queue systems
"""

from typing import List, Optional
from datetime import datetime
from models import Driver, DriverStatus
from config import DEFAULT_GRID_WIDTH, DEFAULT_GRID_HEIGHT, ID_LENGTH
from exceptions import DriverNotFoundError, PositionOutOfBoundsError


class DriverService:
    """Service for managing drivers in the simulation.
    
    The DriverService handles all aspects of driver management including
    creation, movement, state tracking, and trip completion. It ensures
    that drivers move efficiently through the grid and maintain proper
    state transitions during trips.
    
    Driver Lifecycle:
    1. Creation: Driver is created with sequential ID and initial position
    2. Assignment: Driver is assigned to a ride request
    3. Movement: Driver moves to pickup location, then dropoff location
    4. Completion: Driver completes trip and becomes available again
    
    Movement Logic:
    - Drivers move one step per tick towards their target
    - Movement uses Manhattan distance for realistic grid navigation
    - Target coordinates are updated based on trip phase
    - Drivers automatically transition between trip phases
    """
    
    def __init__(self):
        """Initialize the driver service.
        
        Creates an empty list to store all drivers and initializes
        the driver counter for sequential ID generation.
        """
        self.drivers: List[Driver] = []
        self.driver_counter = 0
    
    def generate_driver_id(self) -> str:
        """Generate a sequential driver ID.
        
        Creates driver IDs in the format "Driver 1", "Driver 2", etc.
        This ensures consistent and predictable naming throughout the simulation.
        
        Returns:
            str: The next sequential driver ID
        """
        self.driver_counter += 1
        return f"Driver {self.driver_counter}"
    
    def add_driver(self, x: int, y: int) -> Driver:
        """Add a new driver to the simulation.
        
        Creates a driver at the specified position with initial state.
        The driver starts in 'available' status and is ready to accept
        ride requests.
        
        Driver Initialization:
        - Sequential ID generation (Driver 1, Driver 2, etc.)
        - Initial position at specified coordinates
        - Available status for immediate assignment
        - Zero idle time and trip count
        - No current assignment or target
        
        Args:
            x: X-coordinate for the driver's initial position
            y: Y-coordinate for the driver's initial position
            
        Returns:
            Driver: The newly created driver object
            
        Raises:
            PositionOutOfBoundsError: If coordinates are outside the grid bounds
        """
        # Validate position bounds
        if not (0 <= x < DEFAULT_GRID_WIDTH and 0 <= y < DEFAULT_GRID_HEIGHT):
            raise PositionOutOfBoundsError(f"Position ({x}, {y}) is outside grid bounds")
        
        # Create new driver with sequential ID and initial state
        driver = Driver(
            id=self.generate_driver_id(),
            x=x,
            y=y,
            status=DriverStatus.available,
            idleTicks=0,
            totalTrips=0,
            assignedRequestId=None,
            tripPhase=None,
            targetX=None,
            targetY=None
        )
        
        self.drivers.append(driver)
        return driver
    
    def get_driver(self, driver_id: str) -> Optional[Driver]:
        """Get a driver by ID.
        
        Searches through all drivers to find the one with the specified ID.
        Returns None if no driver is found with the given ID.
        
        Args:
            driver_id: The unique identifier of the driver
            
        Returns:
            Optional[Driver]: The driver object if found, None otherwise
        """
        for driver in self.drivers:
            if driver.id == driver_id:
                return driver
        return None
    
    def get_driver_or_raise(self, driver_id: str) -> Driver:
        """Get a driver by ID or raise an exception if not found."""
        driver = self.get_driver(driver_id)
        if not driver:
            raise DriverNotFoundError(f"Driver {driver_id} not found")
        return driver
    
    def update_driver(self, driver_id: str, updates: dict) -> Driver:
        """Update a driver's properties."""
        driver = self.get_driver_or_raise(driver_id)
        for key, value in updates.items():
            setattr(driver, key, value)
        # The original code had self.drivers[driver_id] = driver, but self.drivers is a list.
        # Assuming the intent was to update the driver in the list if it were a dict.
        # Since it's a list, we need to find and update the driver object.
        for i, d in enumerate(self.drivers):
            if d.id == driver_id:
                self.drivers[i] = driver
                break
        return driver
    
    def remove_driver(self, driver_id: str) -> bool:
        """Remove a driver from the simulation.
        
        Removes the specified driver from the simulation. If the driver
        was currently on a trip, the associated request and rider are
        also affected (handled by the simulation engine).
        
        Args:
            driver_id: The unique identifier of the driver to remove
            
        Returns:
            bool: True if driver was successfully removed, False if driver not found
        """
        for i, driver in enumerate(self.drivers):
            if driver.id == driver_id:
                del self.drivers[i]
                return True
        return False
    
    def list_drivers(self) -> List[Driver]:
        """Get all drivers in the simulation.
        
        Returns a copy of all driver objects currently in the simulation.
        This provides a snapshot of the current driver state for monitoring
        and debugging purposes.
        
        Returns:
            List[Driver]: List of all driver objects currently in the simulation
        """
        return self.drivers.copy()
    
    def get_available_drivers(self) -> List[Driver]:
        """Get all drivers that are currently available.
        
        Filters the driver list to return only drivers with 'available' status.
        These drivers are ready to accept new ride requests.
        
        Returns:
            List[Driver]: List of all available driver objects
        """
        return [driver for driver in self.drivers if driver.status == DriverStatus.available]
    
    def get_busy_drivers(self) -> List[Driver]:
        """Get all drivers that are currently on a trip.
        
        Filters the driver list to return only drivers with 'on_trip' status.
        These drivers are currently moving towards pickup or dropoff locations.
        
        Returns:
            List[Driver]: List of all busy driver objects
        """
        return [driver for driver in self.drivers if driver.status == DriverStatus.on_trip]
    
    def move_driver_one_step(self, driver: Driver) -> None:
        """Move a driver one step towards their target."""
        # Check if driver has a target to move towards
        if driver.targetX is None or driver.targetY is None:
            return
        
        # Calculate movement direction for X coordinate
        if driver.x < driver.targetX:
            driver.x += 1  # Move right
        elif driver.x > driver.targetX:
            driver.x -= 1  # Move left
        
        # Calculate movement direction for Y coordinate
        if driver.y < driver.targetY:
            driver.y += 1  # Move down
        elif driver.y > driver.targetY:
            driver.y -= 1  # Move up
    
    def complete_trip(self, driver: Driver) -> None:
        """Mark a driver's trip as completed."""
        driver.status = DriverStatus.available
        driver.tripPhase = None
        driver.targetX = None
        driver.targetY = None
        driver.assignedRequestId = None
        driver.totalTrips += 1
        driver.idleTicks = 0
    
    def increment_idle_ticks(self, driver: Driver) -> None:
        """Increment the idle time for an available driver."""
        driver.idleTicks += 1
    
    def _is_valid_position(self, x: int, y: int) -> bool:
        """Check if a position is within the grid bounds."""
        return 0 <= x < DEFAULT_GRID_WIDTH and 0 <= y < DEFAULT_GRID_HEIGHT
    
    def clear_drivers(self) -> None:
        """Clear all drivers from the simulation.
        
        Removes all drivers from the simulation. This is typically called
        when the simulation is reset or when the driver list needs to be
        cleared for maintenance purposes.
        """
        self.drivers.clear()
        self.driver_counter = 0 