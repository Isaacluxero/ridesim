"""Service for managing riders."""

from typing import Dict, List, Optional
from models import Rider
from exceptions import RiderNotFoundError, PositionOutOfBoundsError
from config import DEFAULT_GRID_WIDTH, DEFAULT_GRID_HEIGHT


class RiderService:
    """Service for managing riders."""
    
    def __init__(self):
        self.riders: Dict[str, Rider] = {}
        self.rider_counter = 0
    
    def generate_rider_id(self) -> str:
        """Generate a unique rider ID."""
        self.rider_counter += 1
        return f"Rider {self.rider_counter}"
    
    def add_rider(self, pickup_x: int, pickup_y: int, dropoff_x: int, dropoff_y: int) -> Rider:
        """Add a new rider to the simulation."""
        if not self._is_valid_position(pickup_x, pickup_y):
            raise PositionOutOfBoundsError(f"Pickup position ({pickup_x}, {pickup_y}) is out of bounds")
        
        if not self._is_valid_position(dropoff_x, dropoff_y):
            raise PositionOutOfBoundsError(f"Dropoff position ({dropoff_x}, {dropoff_y}) is out of bounds")
        
        rider_id = self.generate_rider_id()
        rider = Rider(
            id=rider_id,
            pickup_x=pickup_x,
            pickup_y=pickup_y,
            dropoff_x=dropoff_x,
            dropoff_y=dropoff_y
        )
        self.riders[rider_id] = rider
        return rider
    
    def get_rider(self, rider_id: str) -> Optional[Rider]:
        """Get a rider by ID."""
        return self.riders.get(rider_id)
    
    def get_rider_or_raise(self, rider_id: str) -> Rider:
        """Get a rider by ID or raise an exception if not found."""
        rider = self.get_rider(rider_id)
        if not rider:
            raise RiderNotFoundError(f"Rider {rider_id} not found")
        return rider
    
    def remove_rider(self, rider_id: str) -> bool:
        """Remove a rider from the simulation."""
        if rider_id in self.riders:
            del self.riders[rider_id]
            return True
        return False
    
    def list_riders(self) -> List[Rider]:
        """Get all riders."""
        return list(self.riders.values())
    
    def get_rider_by_id(self, rider_id: str) -> Optional[Rider]:
        """Get a rider by ID (alias for get_rider)."""
        return self.get_rider(rider_id)
    
    def _is_valid_position(self, x: int, y: int) -> bool:
        """Check if a position is within the grid bounds."""
        return 0 <= x < DEFAULT_GRID_WIDTH and 0 <= y < DEFAULT_GRID_HEIGHT
    
    def clear_riders(self) -> None:
        """Clear all riders."""
        self.riders.clear()
        self.rider_counter = 0 