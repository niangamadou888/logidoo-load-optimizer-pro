import { Trash2, Package as PackageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types/logistics';
import { calculatePackageVolume } from '@/lib/logistics';

interface PackageListProps {
  packages: Package[];
  onRemovePackage: (id: string) => void;
}

export const PackageList = ({ packages, onRemovePackage }: PackageListProps) => {
  if (packages.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25">
        <CardContent className="py-8 text-center text-muted-foreground">
          <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun colis ajouté pour le moment</p>
          <p className="text-sm">Commencez par ajouter des colis à votre chargement</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card-logistics">
      <CardHeader>
        <CardTitle className="text-primary">
          Colis ({packages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors animate-fade-in"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {pkg.type}
                </Badge>
                {pkg.quantity > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    x{pkg.quantity}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {pkg.length} × {pkg.width} × {pkg.height} cm
              </div>
              <div className="text-sm font-medium">
                {pkg.weight * pkg.quantity} kg • {calculatePackageVolume(pkg).toFixed(3)} m³
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemovePackage(pkg.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};