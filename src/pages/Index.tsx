import { useEffect } from 'react';
import { CityGrid } from '@/components/simulation/CityGrid';
import { ControlPanel } from '@/components/simulation/ControlPanel';
import { StatusDashboard } from '@/components/simulation/StatusDashboard';
import {
  useSimulation,
  useDrivers,
  useRiders,
  useSimulationControl
} from '@/hooks';

const Index = () => {
  const {
    state,
    isPolling,
    togglePolling,
    fetchState,
  } = useSimulation();

  const {
    addDriver,
    removeDriver,
  } = useDrivers();

  const {
    addRider,
    removeRider,
    requestRide,
  } = useRiders();

  const {
    resetSimulation: resetSim,
    initializeSimulation,
    advanceTick,
    isSimulationLoading,
  } = useSimulationControl();

  // Initialize simulation on mount
  useEffect(() => {
    const initSimulation = async () => {
      try {
        console.log('Initializing simulation...');
        await initializeSimulation();
        console.log('Simulation initialized successfully');
        // Fetch the updated state after initialization
        await fetchState();
      } catch (error) {
        console.error('Failed to initialize simulation:', error);
      }
    };

    initSimulation();
  }, [initializeSimulation, fetchState]);

  // Extract data from state
  const drivers = state?.drivers || [];
  const riders = state?.riders || [];
  const requests = state?.requests || [];
  const config = state?.config || { gridWidth: 20, gridHeight: 20, driverSpeed: 1, tickInterval: 1000 };
  const stats = state?.stats || { totalRequests: 0, completedRides: 0, failedRides: 0, averageETA: 0, activeDrivers: 0, totalDrivers: 0 };

  console.log('Current state:', { drivers, riders, requests, config, stats });
  console.log('Driver positions:', drivers.map(d => ({ id: d.id, x: d.x, y: d.y, status: d.status })));

  const handleReset = async () => {
    try {
      await resetSim();
      // Fetch the updated state after reset
      await fetchState();
    } catch (error) {
      console.error('Failed to reset simulation:', error);
    }
  };

  const handleAddDriver = async (x: number, y: number) => {
    console.log('Index: Adding driver at position:', x, y);
    const result = await addDriver(x, y);
    if (result) {
      console.log('Index: Driver added successfully, fetching updated state');
      // Fetch the updated state after adding driver
      await fetchState();
    }
  };

  const handleAddRider = async (pickupX: number, pickupY: number, dropoffX: number, dropoffY: number) => {
    console.log('Index: Adding rider with pickup:', pickupX, pickupY, 'dropoff:', dropoffX, dropoffY);
    const result = await addRider(pickupX, pickupY, dropoffX, dropoffY);
    if (result) {
      console.log('Index: Rider added successfully, fetching updated state');
      // Fetch the updated state after adding rider
      await fetchState();
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    console.log('Index: Removing driver:', driverId);
    const success = await removeDriver(driverId);
    if (success) {
      console.log('Index: Driver removed successfully, fetching updated state');
      // Fetch the updated state after removing driver
      await fetchState();
    }
  };

  const handleRemoveRider = async (riderId: string) => {
    console.log('Index: Removing rider:', riderId);
    const success = await removeRider(riderId);
    if (success) {
      console.log('Index: Rider removed successfully, fetching updated state');
      // Fetch the updated state after removing rider
      await fetchState();
    }
  };

  const handleRequestRide = async (riderId: string) => {
    console.log('Index: Requesting ride for rider:', riderId);
    const result = await requestRide(riderId);
    if (result) {
      console.log('Index: Ride requested successfully, fetching updated state');
      // Fetch the updated state after requesting ride
      await fetchState();
    }
  };

  const handleAdvanceTick = async () => {
    console.log('Index: Advancing tick...');
    console.log('Index: Current drivers before tick:', drivers.map(d => ({ id: d.id, x: d.x, y: d.y })));
    try {
      await advanceTick();
      console.log('Index: Tick advanced successfully, fetching updated state');
      // Fetch the updated state after advancing tick
      await fetchState();
      console.log('Index: State fetched after tick');
    } catch (error) {
      console.error('Index: Failed to advance tick:', error);
    }
  };

  const handleAddRandomDriver = async () => {
    const x = Math.floor(Math.random() * config.gridWidth);
    const y = Math.floor(Math.random() * config.gridHeight);
    await handleAddDriver(x, y);
  };

  const handleAddRandomRider = async () => {
    const pickupX = Math.floor(Math.random() * config.gridWidth);
    const pickupY = Math.floor(Math.random() * config.gridHeight);
    let dropoffX, dropoffY;
    do {
      dropoffX = Math.floor(Math.random() * config.gridWidth);
      dropoffY = Math.floor(Math.random() * config.gridHeight);
    } while (dropoffX === pickupX && dropoffY === pickupY);

    await handleAddRider(pickupX, pickupY, dropoffX, dropoffY);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
            Ride-Hailing Simulation
          </h1>
          <p className="text-muted-foreground">
            Real-time dispatching algorithm with smart driver assignment
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* City Grid - Takes up most space */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="max-w-full overflow-auto">
              <CityGrid
                width={config.gridWidth}
                height={config.gridHeight}
                drivers={drivers}
                riders={riders}
                requests={requests}
                cellSize={25}
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel
              isRunning={isPolling}
              onToggleSimulation={togglePolling}
              onReset={handleReset}
              onAddDriver={handleAddDriver}
              onAddRider={handleAddRider}
              onRemoveDriver={handleRemoveDriver}
              onRemoveRider={handleRemoveRider}
              onRequestRide={handleRequestRide}
              onAdvanceTick={handleAdvanceTick}
              gridWidth={config.gridWidth}
              gridHeight={config.gridHeight}
              drivers={drivers}
              riders={riders}
              isAdvancingTick={isSimulationLoading}
            />
          </div>

          {/* Status Dashboard */}
          <div className="lg:col-span-1">
            <StatusDashboard
              drivers={drivers}
              riders={riders}
              requests={requests}
              isRunning={isPolling}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;