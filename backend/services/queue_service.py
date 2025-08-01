"""Service for managing the request queue.

This module contains the QueueService class which implements the FIFO (First In, First Out)
queue system for handling ride requests when no drivers are available.

The queue system ensures that:
1. No rider is ever rejected - they wait in queue until a driver becomes available
2. Fair ordering - riders are served in the order they arrived
3. Automatic assignment - waiting riders are automatically assigned when drivers become available
4. Efficient processing - the queue is processed after every driver state change

Key Features:
- FIFO queue implementation for fair rider ordering
- Automatic processing when drivers become available
- Integration with scoring algorithm for optimal assignments
- Queue statistics and monitoring capabilities
"""

from typing import List, Optional
from datetime import datetime
from models import RideRequest, Driver, DriverStatus
from services.scoring_service import ScoringService
from exceptions import NoAvailableDriversError


class QueueService:
    """Service for managing the request queue.
    
    The QueueService implements a FIFO queue system that ensures no rider is ever
    rejected from the ride-hailing system. When no drivers are available, riders
    are placed in a queue and automatically assigned when drivers become available.
    
    The queue system works in conjunction with the scoring algorithm to ensure
    optimal driver-rider assignments while maintaining fair ordering.
    
    Queue Processing:
    - Riders are added to queue when no drivers are available
    - Queue is processed whenever drivers become available
    - Scoring algorithm determines best driver for each waiting rider
    - Processed riders are removed from queue and assigned to drivers
    """
    
    def __init__(self):
        """Initialize the queue service.
        
        Creates an empty FIFO queue to store waiting ride requests.
        The queue is implemented as a simple list with FIFO ordering.
        """
        self.request_queue: List[RideRequest] = []
    
    def add_to_queue(self, request: RideRequest) -> None:
        """Add a request to the queue.
        
        Places a ride request at the end of the queue (FIFO ordering).
        This ensures that riders are served in the order they arrived.
        
        Args:
            request: The ride request to add to the queue
        """
        self.request_queue.append(request)
    
    def remove_from_queue(self, request: RideRequest) -> None:
        """Remove a request from the queue.
        
        Removes a specific ride request from the queue. This is typically
        called when a request is successfully assigned to a driver.
        
        Args:
            request: The ride request to remove from the queue
        """
        if request in self.request_queue:
            self.request_queue.remove(request)
    
    def get_queue_length(self) -> int:
        """Get the current queue length.
        
        Returns the number of ride requests currently waiting in the queue.
        This provides a metric for system load and rider wait times.
        
        Returns:
            int: Number of requests currently in the queue
        """
        return len(self.request_queue)
    
    def is_queue_empty(self) -> bool:
        """Check if the queue is empty.
        
        Returns True if there are no requests waiting in the queue.
        This is used to optimize queue processing by avoiding unnecessary operations.
        
        Returns:
            bool: True if queue is empty, False otherwise
        """
        return len(self.request_queue) == 0
    
    def get_queued_requests(self) -> List[RideRequest]:
        """Get all requests currently in the queue.
        
        Returns a copy of all requests in the queue. This is used for
        monitoring and debugging purposes without affecting the queue state.
        
        Returns:
            List[RideRequest]: Copy of all requests currently in the queue
        """
        return self.request_queue.copy()
    
    def process_queue(self, available_drivers: List[Driver]) -> List[RideRequest]:
        """Process the queue and assign requests to available drivers.
        
        This is the core queue processing logic that:
        1. Iterates through waiting requests in FIFO order
        2. Uses the scoring algorithm to find the best available driver
        3. Assigns requests to drivers and removes them from the queue
        4. Continues until all requests are assigned or no more drivers available
        
        The algorithm ensures fair assignment while optimizing for efficiency
        and user experience.
        
        Args:
            available_drivers: List of drivers currently available for assignment
            
        Returns:
            List[RideRequest]: List of requests that were successfully assigned
        """
        if not available_drivers or self.is_queue_empty():
            return []
        
        processed_requests = []
        remaining_drivers = available_drivers.copy()
        
        # Process queue in FIFO order - first riders get first priority
        for request in self.request_queue[:]:  # Create a copy to iterate safely
            if not remaining_drivers:
                break
            
            try:
                # Use scoring algorithm to find the best available driver
                # This ensures optimal assignment based on distance, fairness, and idle time
                best_driver = ScoringService.find_best_driver(remaining_drivers, request)
                
                # Assign the request to the selected driver
                self._assign_request_to_driver(request, best_driver)
                
                # Mark for removal from queue
                processed_requests.append(request)
                
                # Remove the assigned driver from remaining list
                # This prevents the same driver from being assigned multiple times
                remaining_drivers = [d for d in remaining_drivers if d.id != best_driver.id]
                
            except ValueError:
                # No suitable driver found, keep request in queue
                # This can happen if all remaining drivers are incompatible
                continue
        
        # Remove processed requests from queue
        # This maintains the FIFO ordering for remaining requests
        for request in processed_requests:
            self.remove_from_queue(request)
        
        return processed_requests
    
    def _assign_request_to_driver(self, request: RideRequest, driver: Driver) -> None:
        """Assign a request to a driver.
        
        Updates both the request and driver objects to establish the assignment.
        This method is called internally by the queue processing logic.
        
        Args:
            request: The ride request to assign
            driver: The driver to assign the request to
        """
        # Update request status and assignment
        request.status = "assigned"
        request.assigned_driver_id = driver.id
        request.updated_at = datetime.now()
        
        # Update driver state for the new assignment
        driver.status = DriverStatus.on_trip
        driver.assignedRequestId = request.id
        driver.tripPhase = "to_pickup"  # First phase: go to pickup location
        driver.targetX = request.pickup_x
        driver.targetY = request.pickup_y
        driver.idleTicks = 0  # Reset idle time since driver is now busy
    
    def clear_queue(self) -> None:
        """Clear all requests from the queue.
        
        Removes all waiting requests from the queue. This is typically called
        when the simulation is reset or when the queue needs to be cleared
        for maintenance purposes.
        """
        self.request_queue.clear() 