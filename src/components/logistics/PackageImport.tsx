import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package } from '@/types/logistics';
import * as XLSX from 'xlsx';

interface PackageImportProps {
  onImportPackages: (packages: Package[]) => void;
}

export const PackageImport = ({ onImportPackages }: PackageImportProps) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Type de colis': 'Carton',
        'Longueur (cm)': 30,
        'Largeur (cm)': 20,
        'Hauteur (cm)': 15,
        'Poids (kg)': 2.5,
        'Quantité': 1
      },
      {
        'Type de colis': 'Palette',
        'Longueur (cm)': 120,
        'Largeur (cm)': 80,
        'Hauteur (cm)': 100,
        'Poids (kg)': 25,
        'Quantité': 2
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle Colis');
    XLSX.writeFile(wb, 'modele_import_colis.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const packages: Package[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          try {
            // Accepter différents formats de colonnes
            const type = row['Type de colis'] || row['Type'] || row['type'] || '';
            const length = parseFloat(row['Longueur (cm)'] || row['Longueur'] || row['length'] || '0');
            const width = parseFloat(row['Largeur (cm)'] || row['Largeur'] || row['width'] || '0');
            const height = parseFloat(row['Hauteur (cm)'] || row['Hauteur'] || row['height'] || '0');
            const weight = parseFloat(row['Poids (kg)'] || row['Poids'] || row['weight'] || '0');
            const quantity = parseInt(row['Quantité'] || row['Quantity'] || row['quantity'] || '1');

            if (type && length > 0 && width > 0 && height > 0 && weight > 0) {
              packages.push({
                id: `import-${Date.now()}-${index}`,
                type,
                length,
                width,
                height,
                weight,
                quantity: quantity > 0 ? quantity : 1
              });
            }
          } catch (error) {
            console.warn(`Erreur ligne ${index + 2}:`, error);
          }
        });

        if (packages.length > 0) {
          onImportPackages(packages);
          setImportStatus('success');
          setImportMessage(`${packages.length} colis importés avec succès`);
          setImportedCount(packages.length);
        } else {
          setImportStatus('error');
          setImportMessage('Aucun colis valide trouvé dans le fichier');
        }
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Erreur lors de la lecture du fichier Excel');
        console.error('Erreur import:', error);
      }
    };

    reader.readAsArrayBuffer(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetStatus = () => {
    setImportStatus('idle');
    setImportMessage('');
    setImportedCount(0);
  };

  return (
    <Card className="shadow-card-logistics border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileSpreadsheet className="h-5 w-5" />
          Import Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {importStatus !== 'idle' && (
          <Alert className={importStatus === 'success' ? 'border-green-500' : 'border-red-500'}>
            {importStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span>{importMessage}</span>
              {importStatus === 'success' && (
                <Badge variant="secondary" className="ml-2">
                  {importedCount} colis
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Template Download */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Téléchargez d'abord le modèle Excel avec les colonnes attendues
          </p>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger le modèle
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sélectionnez votre fichier Excel complété
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-import"
            />
            <Button
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-primary hover:opacity-90 shadow-logistics"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer Excel
            </Button>
            {importStatus !== 'idle' && (
              <Button
                variant="outline"
                size="icon"
                onClick={resetStatus}
                className="shrink-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Format Info */}
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Colonnes attendues :</p>
          <ul className="space-y-1">
            <li>• Type de colis (texte)</li>
            <li>• Longueur (cm) (nombre)</li>
            <li>• Largeur (cm) (nombre)</li>
            <li>• Hauteur (cm) (nombre)</li>
            <li>• Poids (kg) (nombre)</li>
            <li>• Quantité (nombre, optionnel)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};