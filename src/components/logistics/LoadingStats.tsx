import { TrendingUp, Package, Weight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoadingStats as LoadingStatsType } from '@/types/logistics';

interface LoadingStatsProps {
  stats: LoadingStatsType;
}

export const LoadingStats = ({ stats }: LoadingStatsProps) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-destructive';
    if (percentage > 85) return 'text-logistics-amber';
    if (percentage > 70) return 'text-secondary';
    return 'text-primary';
  };

  const getUtilizationStatus = (volumeUtil: number, weightUtil: number) => {
    if (volumeUtil > 100 || weightUtil > 100) {
      return { icon: AlertTriangle, text: 'Surcharge', variant: 'destructive' as const };
    }
    if (volumeUtil > 85 || weightUtil > 85) {
      return { icon: AlertTriangle, text: 'Attention', variant: 'secondary' as const };
    }
    if (volumeUtil > 70 && weightUtil > 70) {
      return { icon: CheckCircle, text: 'Optimal', variant: 'default' as const };
    }
    return { icon: TrendingUp, text: 'Sous-utilisé', variant: 'outline' as const };
  };

  const status = getUtilizationStatus(stats.volumeUtilization, stats.weightUtilization);
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card className="shadow-card-logistics border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-primary">Optimisation du chargement</span>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            {/* Volume Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Volume
                </span>
                <span className={`font-bold ${getUtilizationColor(stats.volumeUtilization)}`}>
                  {stats.volumeUtilization}%
                </span>
              </div>
              <Progress 
                value={Math.min(stats.volumeUtilization, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {stats.totalVolume.toFixed(2)} / {stats.containerVolume.toFixed(2)} m³
              </div>
            </div>

            {/* Weight Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Poids
                </span>
                <span className={`font-bold ${getUtilizationColor(stats.weightUtilization)}`}>
                  {stats.weightUtilization}%
                </span>
              </div>
              <Progress 
                value={Math.min(stats.weightUtilization, 100)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {stats.totalWeight.toFixed(0)} / {stats.containerMaxWeight} kg
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalVolume.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Volume total (m³)</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalWeight.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Poids total (kg)</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {stats.remainingVolume.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Volume restant (m³)</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {stats.remainingWeight.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">Capacité restante (kg)</div>
          </div>
        </Card>
      </div>
    </div>
  );
};