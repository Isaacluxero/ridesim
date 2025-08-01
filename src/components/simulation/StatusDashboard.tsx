import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Driver, Rider, RideRequest } from '@/types/simulation';
import { Car, Users, Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from 'lucide-react';

interface StatusDashboardProps {
  drivers: Driver[];
  riders: Rider[];
  requests: RideRequest[];
  isRunning: boolean;
}

export const StatusDashboard = ({
  drivers,
  riders,
  requests,
  isRunning
}: StatusDashboardProps) => {
  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    busyDrivers: drivers.filter(d => d.status === 'on_trip').length,
    offlineDrivers: drivers.filter(d => d.status === 'offline').length,

    totalRiders: riders.length,

    totalRequests: requests.length,
    waitingRequests: requests.filter(r => r.status === 'waiting').length,
    assignedRequests: requests.filter(r => r.status === 'assigned').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    failedRequests: requests.filter(r => r.status === 'failed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-driver-available';
      case 'on_trip': case 'assigned': return 'bg-driver-busy';
      case 'waiting': return 'bg-rider-waiting';
      case 'completed': return 'bg-secondary';
      case 'failed': case 'offline': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Queue Status */}
      {stats.waitingRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hourglass className="w-5 h-5" />
              Queue ({stats.waitingRequests})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats.waitingRequests} rider{stats.waitingRequests !== 1 ? 's' : ''} waiting for available drivers
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Drivers ({stats.totalDrivers})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Available</span>
            <Badge className={getStatusColor('available')}>
              {stats.availableDrivers}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">On Trip</span>
            <Badge className={getStatusColor('on_trip')}>
              {stats.busyDrivers}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Offline</span>
            <Badge className={getStatusColor('offline')}>
              {stats.offlineDrivers}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Rider Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Riders ({stats.totalRiders})
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Request Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ride Requests ({stats.totalRequests})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <Hourglass className="w-3 h-3" />
              Waiting
            </span>
            <Badge className={getStatusColor('waiting')}>
              {stats.waitingRequests}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Assigned
            </span>
            <Badge className={getStatusColor('assigned')}>
              {stats.assignedRequests}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
            <Badge className={getStatusColor('completed')}>
              {stats.completedRequests}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Drivers */}
      {drivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {drivers.slice(0, 5).map(driver => (
                <div key={driver.id} className="flex justify-between items-center text-sm">
                  <span>{driver.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ({driver.x}, {driver.y})
                    </span>
                    <Badge className={getStatusColor(driver.status)}>
                      {driver.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {drivers.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{drivers.length - 5} more drivers
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};