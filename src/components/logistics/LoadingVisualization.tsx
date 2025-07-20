import { useState, Suspense } from 'react';
import { Eye, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Container } from '@/types/logistics';
import { calculatePackageVolume, calculateContainerVolume } from '@/lib/logistics';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

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

  // Convert HSL to hex for Three.js
  const getPackageColorHex = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'hsl(var(--primary))': '#0ea5e9',
      'hsl(var(--secondary))': '#64748b',
      'hsl(var(--accent))': '#8b5cf6',
      'hsl(var(--logistics-blue))': '#3b82f6',
      'hsl(var(--efficiency-green))': '#10b981',
      'hsl(var(--transport-orange))': '#f59e0b'
    };
    const hslColor = getPackageColor(type);
    return colorMap[hslColor] || '#0ea5e9';
  };

  // Component 3D Scene
  const Scene3D = () => {
    // Convert cm to meters and scale appropriately
    const containerScale = {
      length: container.length / 100,
      width: container.width / 100, 
      height: container.height / 100
    };

    return (
      <>
        {/* Container outline */}
        <Box
          args={[containerScale.length, containerScale.height, containerScale.width]}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.2} wireframe />
        </Box>
        
        {/* Container floor */}
        <Box
          args={[containerScale.length, 0.02, containerScale.width]}
          position={[0, -containerScale.height / 2, 0]}
        >
          <meshStandardMaterial color="#94a3b8" />
        </Box>

        {/* Packages */}
        {packages.slice(0, 12).map((pkg, index) => {
          const pkgScale = {
            length: pkg.length / 100,
            width: pkg.width / 100,
            height: pkg.height / 100
          };
          
          // Simple positioning algorithm
          const cols = 3;
          const rows = 4;
          const x = ((index % cols) - (cols - 1) / 2) * (containerScale.length / cols);
          const z = (Math.floor(index / cols) - (rows - 1) / 2) * (containerScale.width / rows);
          const y = -containerScale.height / 2 + pkgScale.height / 2 + 0.01;

           return (
             <Box 
               key={pkg.id} 
               args={[pkgScale.length, pkgScale.height, pkgScale.width]}
               position={[x, y, z]}
             >
               <meshStandardMaterial color={getPackageColorHex(pkg.type)} />
             </Box>
           );
        })}

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </>
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
            >
              3D
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

        {/* Conditional View Rendering */}
        {view === '3d' ? (
          // 3D Visualization
          packages.length > 0 ? (
            <div className="h-96 w-full">
              <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Chargement de la vue 3D...</div>}>
                <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                  <Scene3D />
                </Canvas>
              </Suspense>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Maximize2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ajoutez des colis pour voir la visualisation 3D</p>
            </div>
          )
        ) : (
          // 2D Visualization
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

            {packages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Maximize2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ajoutez des colis pour voir la visualisation</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};