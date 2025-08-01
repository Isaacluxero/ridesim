"""Custom exceptions for the ride simulation."""


class SimulationError(Exception):
    """Base exception for simulation errors."""
    pass


class DriverNotFoundError(SimulationError):
    """Raised when a driver is not found."""
    pass


class RiderNotFoundError(SimulationError):
    """Raised when a rider is not found."""
    pass


class RequestNotFoundError(SimulationError):
    """Raised when a request is not found."""
    pass


class PositionOutOfBoundsError(SimulationError):
    """Raised when a position is outside the grid bounds."""
    pass


class NoAvailableDriversError(SimulationError):
    """Raised when no drivers are available for assignment."""
    pass


class InvalidRequestError(SimulationError):
    """Raised when a request is invalid."""
    pass 