import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from '@/types/logistics';

interface PackageFormProps {
  onAddPackage: (pkg: Package) => void;
}

export const PackageForm = ({ onAddPackage }: PackageFormProps) => {
  const [formData, setFormData] = useState({
    type: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    quantity: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.length || !formData.width || !formData.height || !formData.weight) {
      return;
    }

    const newPackage: Package = {
      id: Date.now().toString(),
      type: formData.type,
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      quantity: parseInt(formData.quantity)
    };

    onAddPackage(newPackage);
    
    // Reset form
    setFormData({
      type: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      quantity: '1'
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card-logistics border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Plus className="h-5 w-5" />
          Ajouter un colis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="type">Type de colis *</Label>
              <Input
                id="type"
                placeholder="Ex: Carton, Palette, Sac..."
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="length">Longueur (cm) *</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.length}
                onChange={(e) => handleChange('length', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="width">Largeur (cm) *</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="height">Hauteur (cm) *</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Poids (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 shadow-logistics"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le colis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};