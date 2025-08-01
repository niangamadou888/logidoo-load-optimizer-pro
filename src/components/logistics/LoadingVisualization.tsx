import { useState } from 'react';
import { Eye, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Container } from '@/types/logistics';
import { calculatePackageVolume, calculateContainerVolume } from '@/lib/logistics';

interface LoadingVisualizationProps {
  packages: Package[];
  container: Container | null;
}

export const LoadingVisualization = ({ packages, container }: LoadingVisualizationProps) => {
  const [view, setView] = useState<'2d' | '3d'>('2d');

  if (!container) {
    return (
      <Card className="border-dashed border-muted-foreground/25">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Sélectionnez un contenant pour voir la visualisation</p>
        </CardContent>
      </Card>
    );
  }

  const containerVolume = calculateContainerVolume(container);
  const totalPackageVolume = packages.reduce((sum, pkg) => sum + calculatePackageVolume(pkg), 0);
  const fillPercentage = containerVolume > 0 ? (totalPackageVolume / containerVolume) * 100 : 0;

  // Generate colors for different package types
  const packageTypes = [...new Set(packages.map(pkg => pkg.type))];
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--logistics-blue))',
    'hsl(var(--efficiency-green))',
    'hsl(var(--transport-orange))'
  ];

  const getPackageColor = (type: string) => {
    const index = packageTypes.indexOf(type);
    return colors[index % colors.length];
  };

  return (
    <Card className="shadow-card-logistics">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-primary">Visualisation du chargement</span>
          <div className="flex gap-2">
            <Button
              variant={view === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('2d')}
            >
              2D
            </Button>
            <Button
              variant={view === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('3d')}
              disabled
            >
              3D (Bientôt)
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Container Overview */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{container.name}</h4>
            <span className="text-sm text-muted-foreground">
              Remplissage: {fillPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {container.length} × {container.width} × {container.height} cm
          </div>
        </div>

        {/* 2D Visualization */}
        <div className="space-y-4">
          {/* Top View */}
          <div>
            <h5 className="text-sm font-medium mb-2">Vue de dessus</h5>
            <div className="relative bg-background border-2 border-dashed border-primary/30 rounded-lg overflow-hidden">
              <div 
                className="bg-gradient-to-br from-muted/30 to-muted/60"
                style={{
                  width: '300px',
                  height: `${(container.width / container.length) * 300}px`,
                  minHeight: '120px'
                }}
              >
                {/* Simple package representation */}
                {packages.slice(0, 8).map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className="absolute rounded-sm border border-white/50 flex items-center justify-center text-xs font-medium text-white shadow-sm"
                    style={{
                      backgroundColor: getPackageColor(pkg.type),
                      left: `${(index % 4) * 22 + 5}%`,
                      top: `${Math.floor(index / 4) * 35 + 10}%`,
                      width: '18%',
                      height: '25%',
                      opacity: 0.8
                    }}
                  >
                    {pkg.quantity > 1 ? `${pkg.quantity}x` : '1'}
                  </div>
                ))}
                
                {packages.length > 8 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{packages.length - 8} colis
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side View */}
          <div>
            <h5 className="text-sm font-medium mb-2">Vue de côté</h5>
            <div className="relative bg-background border-2 border-dashed border-primary/30 rounded-lg overflow-hidden">
              <div 
                className="bg-gradient-to-br from-muted/30 to-muted/60"
                style={{
                  width: '300px',
                  height: `${(container.height / container.length) * 300}px`,
                  minHeight: '100px'
                }}
              >
                {/* Simplified side view representation */}
                <div 
                  className="absolute bottom-0 left-0 bg-primary/20 border-t-2 border-primary/40 rounded-t"
                  style={{
                    width: `${Math.min(fillPercentage, 100)}%`,
                    height: '60%'
                  }}
                />
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                  Niveau de remplissage: {fillPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Package Legend */}
          {packages.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Légende des colis</h5>
              <div className="grid grid-cols-2 gap-2">
                {packageTypes.map((type, index) => (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded border border-white/50"
                      style={{ backgroundColor: getPackageColor(type) }}
                    />
                    <span>{type}</span>
                    <span className="text-muted-foreground text-xs">
                      ({packages.filter(p => p.type === type).length})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Maximize2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Ajoutez des colis pour voir la visualisation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};