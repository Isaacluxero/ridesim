import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Plus, Users, Car, Minus, Clock, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleSimulation: () => void;
  onReset: () => void;
  onAddDriver: (x: number, y: number) => void;
  onAddRider: (pickupX: number, pickupY: number, dropoffX: number, dropoffY: number) => void;
  onRemoveDriver: (driverId: string) => void;
  onRemoveRider: (riderId: string) => void;
  onRequestRide: (riderId: string) => void;
  onAdvanceTick: () => void;
  gridWidth: number;
  gridHeight: number;
  drivers: Array<{ id: string; x: number; y: number; status: string }>;
  riders: Array<{ id: string; pickup_x: number; pickup_y: number; dropoff_x: number; dropoff_y: number }>;
  isAdvancingTick?: boolean;
}

export const ControlPanel = ({
  isRunning,
  onToggleSimulation,
  onReset,
  onAddDriver,
  onAddRider,
  onRemoveDriver,
  onRemoveRider,
  onRequestRide,
  onAdvanceTick,
  gridWidth,
  gridHeight,
  drivers,
  riders,
  isAdvancingTick = false
}: ControlPanelProps) => {
  const [driverX, setDriverX] = useState(0);
  const [driverY, setDriverY] = useState(0);
  const [pickupX, setPickupX] = useState(0);
  const [pickupY, setPickupY] = useState(0);
  const [dropoffX, setDropoffX] = useState(5);
  const [dropoffY, setDropoffY] = useState(5);

  const handleAddDriver = () => {
    if (driverX >= 0 && driverX < gridWidth && driverY >= 0 && driverY < gridHeight) {
      onAddDriver(driverX, driverY);
    }
  };

  const handleAddRider = () => {
    if (
      pickupX >= 0 && pickupX < gridWidth &&
      pickupY >= 0 && pickupY < gridHeight &&
      dropoffX >= 0 && dropoffX < gridWidth &&
      dropoffY >= 0 && dropoffY < gridHeight
    ) {
      onAddRider(pickupX, pickupY, dropoffX, dropoffY);
    }
  };

  const addRandomDriver = () => {
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    onAddDriver(x, y);
  };

  const addRandomRider = () => {
    const pickupX = Math.floor(Math.random() * gridWidth);
    const pickupY = Math.floor(Math.random() * gridHeight);
    let dropoffX, dropoffY;
    do {
      dropoffX = Math.floor(Math.random() * gridWidth);
      dropoffY = Math.floor(Math.random() * gridHeight);
    } while (dropoffX === pickupX && dropoffY === pickupY);

    onAddRider(pickupX, pickupY, dropoffX, dropoffY);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={onAdvanceTick}
              className="flex-1"
              disabled={isAdvancingTick}
            >
              {isAdvancingTick ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              {isAdvancingTick ? 'Processing...' : 'Next Tick'}
            </Button>
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Driver */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Add Driver
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="driver-x">X Position</Label>
              <Input
                id="driver-x"
                type="number"
                min="0"
                max={gridWidth - 1}
                value={driverX}
                onChange={(e) => setDriverX(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="driver-y">Y Position</Label>
              <Input
                id="driver-y"
                type="number"
                min="0"
                max={gridHeight - 1}
                value={driverY}
                onChange={(e) => setDriverY(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddDriver} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
            <Button onClick={addRandomDriver} variant="outline">
              Random
            </Button>
          </div>
          {drivers.length > 0 && (
            <div className="space-y-2">
              <Label>Remove Driver</Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {drivers.map(driver => (
                  <div key={driver.id} className="flex justify-between items-center text-sm">
                    <span>{driver.id} ({driver.x}, {driver.y})</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveDriver(driver.id)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Rider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add Rider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pickup-x">Pickup X</Label>
              <Input
                id="pickup-x"
                type="number"
                min="0"
                max={gridWidth - 1}
                value={pickupX}
                onChange={(e) => setPickupX(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="pickup-y">Pickup Y</Label>
              <Input
                id="pickup-y"
                type="number"
                min="0"
                max={gridHeight - 1}
                value={pickupY}
                onChange={(e) => setPickupY(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dropoff-x">Dropoff X</Label>
              <Input
                id="dropoff-x"
                type="number"
                min="0"
                max={gridWidth - 1}
                value={dropoffX}
                onChange={(e) => setDropoffX(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="dropoff-y">Dropoff Y</Label>
              <Input
                id="dropoff-y"
                type="number"
                min="0"
                max={gridHeight - 1}
                value={dropoffY}
                onChange={(e) => setDropoffY(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddRider} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Rider
            </Button>
            <Button onClick={addRandomRider} variant="outline">
              Random
            </Button>
          </div>
          {riders.length > 0 && (
            <div className="space-y-2">
              <Label>Remove Rider</Label>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {riders.map(rider => (
                  <div key={rider.id} className="flex justify-between items-center text-sm">
                    <span>{rider.id} ({rider.pickup_x}, {rider.pickup_y}) → ({rider.dropoff_x}, {rider.dropoff_y})</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveRider(rider.id)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => {
              addRandomDriver();
              addRandomDriver();
              addRandomDriver();
            }}
            variant="outline"
            className="w-full"
          >
            Add 3 Random Drivers
          </Button>
          <Button
            onClick={() => {
              addRandomRider();
              addRandomRider();
            }}
            variant="outline"
            className="w-full"
          >
            Add 2 Random Riders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};