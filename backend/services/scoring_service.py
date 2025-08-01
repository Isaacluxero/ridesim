"""Service for calculating driver scores and ETAs.

This module contains the ScoringService class which implements the core business logic
for determining the optimal driver-rider assignments in the ride-hailing simulation.

The scoring algorithm balances multiple factors to ensure fair and efficient assignments:
- Distance: Closer drivers get higher priority
- Fairness: Drivers with fewer total trips get bonus points
- Idle Time: Drivers who have been waiting longer get priority
- ETA Calculation: Uses Manhattan distance for realistic travel time estimates

The algorithm ensures that:
1. No rider is left waiting indefinitely (queue system handles this)
2. Drivers are assigned fairly based on their workload
3. Travel times are minimized for better user experience
4. The system remains efficient and scalable
"""

from typing import List, Tuple
from models import Driver, RideRequest
from config import FAIRNESS_BONUS_MULTIPLIER, MAX_IDLE_TIME_BONUS


class ScoringService:
    """Service for calculating driver scores and ETAs.
    
    The ScoringService implements the core business logic for driver-rider assignment
    optimization. It uses a multi-factor scoring system that balances efficiency,
    fairness, and user experience.
    
    Key Features:
    - Manhattan distance calculation for realistic travel times
    - Fairness bonus to prevent driver overwork
    - Idle time bonus to prioritize waiting drivers
    - ETA calculation for accurate time estimates
    """
    
    @staticmethod
    def calculate_driver_score(driver: Driver, request: RideRequest) -> float:
        """Calculate the score for a driver to handle a specific request.
        
        This is the core scoring algorithm that determines which driver should
        be assigned to a specific ride request. The score is calculated using
        multiple factors to ensure optimal assignments.
        
        Scoring Formula:
        Score = ETA + Fairness_Bonus - Idle_Time_Bonus
        
        Where:
        - ETA: Estimated time to reach pickup location (Manhattan distance)
        - Fairness_Bonus: Bonus for drivers with fewer total trips (prevents overwork)
        - Idle_Time_Bonus: Bonus for drivers who have been waiting longer
        
        Lower scores are better - the driver with the lowest score gets the assignment.
        
        Args:
            driver: The driver being evaluated for the assignment
            request: The ride request that needs a driver
            
        Returns:
            float: The calculated score (lower is better)
        """
        # Calculate ETA to pickup location using Manhattan distance
        eta = ScoringService.calculate_eta(
            driver.x, driver.y, 
            request.pickup_x, request.pickup_y
        )
        
        # Fairness bonus: Drivers with fewer trips get priority
        # This prevents some drivers from getting overworked while others sit idle
        fairness_bonus = driver.totalTrips * FAIRNESS_BONUS_MULTIPLIER
        
        # Idle time bonus: Drivers who have been waiting longer get priority
        # This ensures fair distribution of work among available drivers
        idle_time_bonus = min(driver.idleTicks, MAX_IDLE_TIME_BONUS)
        
        # Final score calculation
        # Lower scores are better, so we add fairness bonus and subtract idle bonus
        return eta + fairness_bonus - idle_time_bonus
    
    @staticmethod
    def calculate_eta(from_x: int, from_y: int, to_x: int, to_y: int, driver_speed: int = 1) -> int:
        """Calculate ETA between two points using Manhattan distance.
        
        Uses Manhattan distance (L1 norm) which is more realistic for city grid
        navigation than Euclidean distance. The calculation assumes drivers move
        at a constant speed of 1 unit per tick.
        
        Manhattan Distance Formula:
        distance = |x1 - x2| + |y1 - y2|
        eta = ceil(distance / speed)
        
        This provides realistic travel time estimates for grid-based movement.
        
        Args:
            from_x: Starting X coordinate
            from_y: Starting Y coordinate
            to_x: Destination X coordinate
            to_y: Destination Y coordinate
            driver_speed: Speed of the driver (units per tick, default 1)
            
        Returns:
            int: Estimated time of arrival in ticks
        """
        # Calculate Manhattan distance (L1 norm)
        # This is more realistic for grid-based movement than Euclidean distance
        distance = abs(from_x - to_x) + abs(from_y - to_y)
        
        # Calculate ETA by dividing distance by speed and rounding up
        # This ensures we don't underestimate travel time
        return (distance + driver_speed - 1) // driver_speed
    
    @staticmethod
    def find_best_driver(drivers: List[Driver], request: RideRequest) -> Driver:
        """Find the best driver for a given request.
        
        Evaluates all available drivers using the scoring algorithm and returns
        the driver with the lowest score (best match). This method implements
        the core assignment logic for the ride-hailing system.
        
        The algorithm ensures:
        - Optimal travel times for riders
        - Fair distribution of work among drivers
        - Efficient use of available resources
        
        Args:
            drivers: List of available drivers to evaluate
            request: The ride request that needs a driver
            
        Returns:
            Driver: The best driver for the request
            
        Raises:
            ValueError: If no drivers are provided for evaluation
        """
        if not drivers:
            raise ValueError("No drivers provided")
        
        # Calculate scores for all available drivers
        # Each driver is evaluated based on distance, fairness, and idle time
        scored_drivers = [
            (driver, ScoringService.calculate_driver_score(driver, request))
            for driver in drivers
        ]
        
        # Sort by score (lower is better) and return the best driver
        # This ensures optimal assignment based on all scoring factors
        scored_drivers.sort(key=lambda x: x[1])
        return scored_drivers[0][0]
    
    @staticmethod
    def calculate_distance(from_x: int, from_y: int, to_x: int, to_y: int) -> int:
        """Calculate Manhattan distance between two points.
        
        Manhattan distance (L1 norm) is used because it's more realistic for
        grid-based city navigation. It represents the actual distance a driver
        would travel in a city grid system.
        
        Formula: distance = |x1 - x2| + |y1 - y2|
        
        Args:
            from_x: Starting X coordinate
            from_y: Starting Y coordinate
            to_x: Destination X coordinate
            to_y: Destination Y coordinate
            
        Returns:
            int: Manhattan distance between the two points
        """
        return abs(from_x - to_x) + abs(from_y - to_y) 