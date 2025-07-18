import { useState } from 'react';
import { Truck, Container as ContainerIcon, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/types/logistics';
import { standardContainers, calculateContainerVolume } from '@/lib/logistics';

interface ContainerSelectorProps {
  selectedContainer: Container | null;
  onSelectContainer: (container: Container) => void;
  suggestedContainer?: Container;
}

export const ContainerSelector = ({ 
  selectedContainer, 
  onSelectContainer, 
  suggestedContainer 
}: ContainerSelectorProps) => {
  const [showAll, setShowAll] = useState(false);

  const displayContainers = showAll ? standardContainers : standardContainers.slice(0, 3);

  const getContainerIcon = (type: string) => {
    return type === 'truck' ? Truck : ContainerIcon;
  };

  return (
    <Card className="shadow-card-logistics">
      <CardHeader>
        <CardTitle className="text-primary">Choix du contenant</CardTitle>
        {suggestedContainer && (
          <div className="flex items-center gap-2 text-sm text-secondary font-medium">
            <Lightbulb className="h-4 w-4" />
            Suggestion automatique : {suggestedContainer.name}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayContainers.map((container) => {
          const Icon = getContainerIcon(container.type);
          const volume = calculateContainerVolume(container);
          const isSelected = selectedContainer?.id === container.id;
          const isSuggested = suggestedContainer?.id === container.id;
          
          return (
            <div
              key={container.id}
              className={`
                relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-logistics' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }
              `}
              onClick={() => onSelectContainer(container)}
            >
              {isSuggested && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground"
                >
                  Suggéré
                </Badge>
              )}
              
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="font-medium">{container.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {container.length} × {container.width} × {container.height} cm
                  </div>
                  <div className="text-sm font-medium text-logistics-blue">
                    {volume.toFixed(1)} m³ • {container.maxWeight} kg max
                  </div>
                </div>
                
                <Badge variant={container.type === 'truck' ? 'default' : 'secondary'}>
                  {container.type === 'truck' ? 'Camion' : 'Conteneur'}
                </Badge>
              </div>
            </div>
          );
        })}
        
        {!showAll && standardContainers.length > 3 && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowAll(true)}
          >
            Voir tous les contenants ({standardContainers.length - 3} de plus)
          </Button>
        )}
        
        {showAll && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowAll(false)}
          >
            Voir moins
          </Button>
        )}
      </CardContent>
    </Card>
  );
};