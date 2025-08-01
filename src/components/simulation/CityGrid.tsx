import { Driver, Rider, RideRequest } from '@/types/simulation';
import { useState } from 'react';

interface CityGridProps {
  width: number;
  height: number;
  drivers: Driver[];
  riders: Rider[];
  requests: RideRequest[];
  cellSize?: number;
}

export const CityGrid = ({
  width,
  height,
  drivers,
  riders,
  requests,
  cellSize = 25
}: CityGridProps) => {
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: '',
    x: 0,
    y: 0,
    visible: false
  });

  const getDriverColor = (driver: Driver) => {
    switch (driver.status) {
      case 'available': return 'hsl(var(--driver-available))';
      case 'on_trip': return 'hsl(var(--driver-busy))';
      case 'offline': return 'hsl(var(--driver-offline))';
      default: return 'hsl(var(--driver-offline))';
    }
  };

  const getDriverIcon = (driver: Driver) => {
    switch (driver.status) {
      case 'available': return '🚗';
      case 'on_trip': return '🚕';
      case 'offline': return '🚙';
      default: return '🚗';
    }
  };

  const getRiderColor = (rider: Rider) => {
    const request = requests.find(r => r.rider_id === rider.id);
    if (request?.status === 'assigned') return 'hsl(var(--rider-assigned))';
    return 'hsl(var(--rider-waiting))';
  };

  const handleMouseEnter = (text: string, event: React.MouseEvent) => {
    setTooltip({
      text,
      x: event.clientX + 10,
      y: event.clientY - 10,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="relative border border-border rounded-lg overflow-hidden bg-grid-bg">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="block"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              stroke="hsl(var(--grid-line))"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* Riders (pickup and dropoff points) */}
        {riders.map(rider => {
          const color = getRiderColor(rider);
          return (
            <g key={rider.id}>
              {/* Pickup point */}
              <circle
                cx={rider.pickup_x * cellSize + cellSize / 2}
                cy={rider.pickup_y * cellSize + cellSize / 2}
                r={8}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(`${rider.id} Pickup`, e)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={rider.pickup_x * cellSize + cellSize / 2}
                y={rider.pickup_y * cellSize + cellSize / 2 + 3}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
              >
                P
              </text>

              {/* Dropoff point */}
              <rect
                x={rider.dropoff_x * cellSize + cellSize / 2 - 8}
                y={rider.dropoff_y * cellSize + cellSize / 2 - 8}
                width="16"
                height="16"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(`${rider.id} Dropoff`, e)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={rider.dropoff_x * cellSize + cellSize / 2}
                y={rider.dropoff_y * cellSize + cellSize / 2 + 3}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
              >
                D
              </text>

              {/* Connection line */}
              <line
                x1={rider.pickup_x * cellSize + cellSize / 2}
                y1={rider.pickup_y * cellSize + cellSize / 2}
                x2={rider.dropoff_x * cellSize + cellSize / 2}
                y2={rider.dropoff_y * cellSize + cellSize / 2}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* Drivers */}
        {drivers.map(driver => (
          <g key={driver.id}>
            <circle
              cx={driver.x * cellSize + cellSize / 2}
              cy={driver.y * cellSize + cellSize / 2}
              r={10}
              fill={getDriverColor(driver)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-500 ease-in-out cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(`${driver.id} (${driver.x}, ${driver.y})`, e)}
              onMouseLeave={handleMouseLeave}
            />
            <text
              x={driver.x * cellSize + cellSize / 2}
              y={driver.y * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              fontSize="12"
            >
              {getDriverIcon(driver)}
            </text>

            {/* Trip path for busy drivers */}
            {driver.status === 'on_trip' && driver.targetX !== undefined && driver.targetY !== undefined && (
              <line
                x1={driver.x * cellSize + cellSize / 2}
                y1={driver.y * cellSize + cellSize / 2}
                x2={driver.targetX * cellSize + cellSize / 2}
                y2={driver.targetY * cellSize + cellSize / 2}
                stroke={getDriverColor(driver)}
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.7"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 px-2 py-1 text-sm text-white bg-black rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};