
import { useState } from 'react';
import { Eye, Maximize2, RotateCcw } from 'lucide-react';
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
  const [selectedView, setSelectedView] = useState<'multi' | 'top' | 'side' | 'front'>('multi');

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

  const renderContainerView = (viewType: 'top' | 'side' | 'front', width: number, height: number) => {
    let dimensions = { width, height };
    let title = '';
    
    switch (viewType) {
      case 'top':
        title = 'Vue de dessus';
        dimensions = { width: 200, height: (container.width / container.length) * 200 };
        break;
      case 'side':
        title = 'Vue de côté';
        dimensions = { width: 200, height: (container.height / container.length) * 200 };
        break;
      case 'front':
        title = 'Vue de face';
        dimensions = { width: 200, height: (container.height / container.width) * 200 };
        break;
    }

    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-center">{title}</h5>
        <div className="flex justify-center">
          <div className="relative bg-background border-2 border-dashed border-primary/30 rounded-lg overflow-hidden">
            <div 
              className="bg-gradient-to-br from-muted/30 to-muted/60 relative"
              style={{
                width: `${dimensions.width}px`,
                height: `${Math.max(dimensions.height, 80)}px`,
              }}
            >
              {/* Container dimensions label */}
              <div className="absolute top-1 left-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                {viewType === 'top' && `${container.length} × ${container.width} cm`}
                {viewType === 'side' && `${container.length} × ${container.height} cm`}
                {viewType === 'front' && `${container.width} × ${container.height} cm`}
              </div>

              {/* Package representation */}
              {packages.slice(0, 12).map((pkg, index) => {
                const cols = viewType === 'front' ? 3 : 4;
                const rows = Math.ceil(12 / cols);
                const col = index % cols;
                const row = Math.floor(index / cols);
                
                return (
                  <div
                    key={pkg.id}
                    className="absolute rounded-sm border border-white/50 flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all hover:scale-105 hover:z-10"
                    style={{
                      backgroundColor: getPackageColor(pkg.type),
                      left: `${(col * (90 / cols)) + 5}%`,
                      top: `${(row * (70 / rows)) + 15}%`,
                      width: `${80 / cols}%`,
                      height: `${60 / rows}%`,
                      opacity: 0.9,
                    }}
                    title={`${pkg.type} - ${pkg.quantity}x (${pkg.length}×${pkg.width}×${pkg.height} cm)`}
                  >
                    {pkg.quantity > 1 ? `${pkg.quantity}x` : '1'}
                  </div>
                );
              })}
              
              {packages.length > 12 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{packages.length - 12}
                </div>
              )}

              {/* Fill level indicator */}
              <div 
                className="absolute bottom-0 left-0 bg-primary/20 border-t-2 border-primary/40"
                style={{
                  width: `${Math.min(fillPercentage * 0.8, 80)}%`,
                  height: `${Math.min(fillPercentage * 0.6, 60)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
            <div>Longueur: {container.length} cm</div>
            <div>Largeur: {container.width} cm</div>
            <div>Hauteur: {container.height} cm</div>
            <div>Volume: {containerVolume.toFixed(2)} m³</div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={selectedView === 'multi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('multi')}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Multi-vues
          </Button>
          <Button
            variant={selectedView === 'top' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('top')}
          >
            Dessus
          </Button>
          <Button
            variant={selectedView === 'side' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('side')}
          >
            Côté
          </Button>
          <Button
            variant={selectedView === 'front' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('front')}
          >
            Face
          </Button>
        </div>

        {/* 2D Visualization */}
        <div className="space-y-4">
          {selectedView === 'multi' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderContainerView('top', 200, 150)}
              {renderContainerView('side', 200, 120)}
              {renderContainerView('front', 200, 120)}
            </div>
          ) : (
            <div className="flex justify-center">
              {renderContainerView(selectedView, 300, 250)}
            </div>
          )}

          {/* Package Legend */}
          {packages.length > 0 && (
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-3">Légende des colis</h5>
              <div className="grid grid-cols-2 gap-2">
                {packageTypes.map((type, index) => {
                  const typePackages = packages.filter(p => p.type === type);
                  const totalQuantity = typePackages.reduce((sum, pkg) => sum + pkg.quantity, 0);
                  const averageVolume = typePackages.reduce((sum, pkg) => sum + calculatePackageVolume(pkg), 0) / typePackages.length;
                  
                  return (
                    <div key={type} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                      <div 
                        className="w-4 h-4 rounded border border-white/50"
                        style={{ backgroundColor: getPackageColor(type) }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{type}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalQuantity} colis • {averageVolume.toFixed(3)} m³ moy.
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading Statistics */}
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Utilisation volume</div>
                <div className="font-medium text-primary">{fillPercentage.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Espace restant</div>
                <div className="font-medium text-secondary">
                  {Math.max(0, containerVolume - totalPackageVolume).toFixed(2)} m³
                </div>
              </div>
            </div>
          </div>
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
