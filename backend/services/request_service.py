"""Service for managing ride requests."""

from typing import Dict, List, Optional
from datetime import datetime
from models import RideRequest, Rider, Driver
from exceptions import RiderNotFoundError, RequestNotFoundError
from services.scoring_service import ScoringService


class RequestService:
    """Service for managing ride requests."""
    
    def __init__(self):
        self.requests: Dict[str, RideRequest] = {}
        self.request_counter = 0
    
    def generate_request_id(self) -> str:
        """Generate a unique request ID."""
        self.request_counter += 1
        return f"Request {self.request_counter}"
    
    def create_request(self, rider: Rider) -> RideRequest:
        """Create a new ride request for a rider."""
        request_id = self.generate_request_id()
        request = RideRequest(
            id=request_id,
            rider_id=rider.id,
            status="waiting",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            pickup_x=rider.pickup_x,
            pickup_y=rider.pickup_y,
            dropoff_x=rider.dropoff_x,
            dropoff_y=rider.dropoff_y
        )
        self.requests[request_id] = request
        return request
    
    def get_request(self, request_id: str) -> Optional[RideRequest]:
        """Get a request by ID."""
        return self.requests.get(request_id)
    
    def get_request_or_raise(self, request_id: str) -> RideRequest:
        """Get a request by ID or raise an exception if not found."""
        request = self.get_request(request_id)
        if not request:
            raise RequestNotFoundError(f"Request {request_id} not found")
        return request
    
    def list_requests(self) -> List[RideRequest]:
        """Get all requests."""
        return list(self.requests.values())
    
    def get_requests_by_status(self, status: str) -> List[RideRequest]:
        """Get all requests with a specific status."""
        return [req for req in self.list_requests() if req.status == status]
    
    def get_waiting_requests(self) -> List[RideRequest]:
        """Get all waiting requests."""
        return self.get_requests_by_status("waiting")
    
    def get_assigned_requests(self) -> List[RideRequest]:
        """Get all assigned requests."""
        return self.get_requests_by_status("assigned")
    
    def get_completed_requests(self) -> List[RideRequest]:
        """Get all completed requests."""
        return self.get_requests_by_status("completed")
    
    def assign_request(self, request: RideRequest, driver: Driver) -> None:
        """Assign a request to a driver."""
        request.status = "assigned"
        request.assigned_driver_id = driver.id
        request.updated_at = datetime.now()
    
    def complete_request(self, request: RideRequest) -> None:
        """Mark a request as completed."""
        request.status = "completed"
        request.updated_at = datetime.now()
    
    def remove_requests_for_rider(self, rider_id: str) -> None:
        """Remove all requests for a specific rider."""
        requests_to_remove = [
            req_id for req_id, req in self.requests.items() 
            if req.rider_id == rider_id
        ]
        for req_id in requests_to_remove:
            del self.requests[req_id]
    
    def clear_requests(self) -> None:
        """Clear all requests."""
        self.requests.clear()
        self.request_counter = 0 