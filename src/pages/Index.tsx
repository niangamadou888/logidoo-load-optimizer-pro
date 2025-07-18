import { useState, useEffect } from 'react';
import { Package as PackageIcon, Truck, Target, BarChart3 } from 'lucide-react';
import { PackageForm } from '@/components/logistics/PackageForm';
import { PackageList } from '@/components/logistics/PackageList';
import { ContainerSelector } from '@/components/logistics/ContainerSelector';
import { LoadingStats } from '@/components/logistics/LoadingStats';
import { LoadingVisualization } from '@/components/logistics/LoadingVisualization';
import { ExportOptions } from '@/components/logistics/ExportOptions';
import { Package, Container } from '@/types/logistics';
import { calculateLoadingStats, suggestOptimalContainer } from '@/lib/logistics';

const Index = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [suggestedContainer, setSuggestedContainer] = useState<Container | null>(null);

  // Auto-suggest container when packages change
  useEffect(() => {
    if (packages.length > 0) {
      const suggested = suggestOptimalContainer(packages);
      setSuggestedContainer(suggested);
      
      // Auto-select if no container is currently selected
      if (!selectedContainer) {
        setSelectedContainer(suggested);
      }
    } else {
      setSuggestedContainer(null);
    }
  }, [packages, selectedContainer]);

  const handleAddPackage = (pkg: Package) => {
    setPackages(prev => [...prev, pkg]);
  };

  const handleRemovePackage = (id: string) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const handleSelectContainer = (container: Container) => {
    setSelectedContainer(container);
  };

  const stats = selectedContainer 
    ? calculateLoadingStats(packages, selectedContainer)
    : {
        totalVolume: 0,
        totalWeight: 0,
        containerVolume: 0,
        containerMaxWeight: 0,
        volumeUtilization: 0,
        weightUtilization: 0,
        remainingVolume: 0,
        remainingWeight: 0
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Logidoo</h1>
              <p className="text-muted-foreground">Module Aide au Chargement</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <PackageIcon className="h-5 w-5" />
              Gestion des colis
            </div>
            
            <PackageForm onAddPackage={handleAddPackage} />
            <PackageList packages={packages} onRemovePackage={handleRemovePackage} />
          </div>

          {/* Middle Column - Container & Stats */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Target className="h-5 w-5" />
              Optimisation
            </div>
            
            <ContainerSelector
              selectedContainer={selectedContainer}
              onSelectContainer={handleSelectContainer}
              suggestedContainer={suggestedContainer}
            />
            
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <BarChart3 className="h-5 w-5" />
              Statistiques
            </div>
            
            <LoadingStats stats={stats} />
          </div>

          {/* Right Column - Visualization & Export */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <LoadingVisualization packages={packages} container={selectedContainer} />
            <ExportOptions packages={packages} container={selectedContainer} stats={stats} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-muted-foreground">
          <p className="text-sm">
            Logidoo © 2024 - Optimisation logistique intelligente
          </p>
          <p className="text-xs mt-1">
            Module Aide au Chargement - Version MVP
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
