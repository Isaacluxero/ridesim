"""Configuration constants for the ride simulation."""

from typing import Final

# Simulation Configuration
DEFAULT_GRID_WIDTH: Final[int] = 20
DEFAULT_GRID_HEIGHT: Final[int] = 20
DEFAULT_DRIVER_SPEED: Final[int] = 1
DEFAULT_TICK_INTERVAL: Final[int] = 1000

# Scoring Algorithm Constants
FAIRNESS_BONUS_MULTIPLIER: Final[int] = 10
MAX_IDLE_TIME_BONUS: Final[int] = 50

# API Configuration
API_HOST: Final[str] = "0.0.0.0"
API_PORT: Final[int] = 8000
CORS_ORIGINS: Final[list[str]] = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
]

# ID Generation
ID_LENGTH: Final[int] = 9 