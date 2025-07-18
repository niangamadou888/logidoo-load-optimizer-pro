import { Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Container, LoadingStats } from '@/types/logistics';

interface ExportOptionsProps {
  packages: Package[];
  container: Container | null;
  stats: LoadingStats;
}

export const ExportOptions = ({ packages, container, stats }: ExportOptionsProps) => {
  const generatePDFReport = () => {
    if (!container) return;

    // Simple PDF generation simulation
    const reportData = {
      title: 'Plan de Chargement Logidoo',
      date: new Date().toLocaleDateString('fr-FR'),
      container: container.name,
      packages: packages.length,
      totalWeight: stats.totalWeight,
      totalVolume: stats.totalVolume,
      utilization: {
        volume: stats.volumeUtilization,
        weight: stats.weightUtilization
      }
    };

    // In a real app, this would generate a PDF
    console.log('Generating PDF with data:', reportData);
    
    // Create a simple text report for demo
    const reportText = `
PLAN DE CHARGEMENT LOGIDOO
=====================================
Date: ${reportData.date}
Contenant: ${reportData.container}

RÉSUMÉ
------
Nombre de colis: ${reportData.packages}
Poids total: ${reportData.totalWeight.toFixed(2)} kg
Volume total: ${reportData.totalVolume.toFixed(2)} m³
Taux de remplissage volume: ${reportData.utilization.volume.toFixed(1)}%
Taux de remplissage poids: ${reportData.utilization.weight.toFixed(1)}%

DÉTAIL DES COLIS
----------------
${packages.map((pkg, index) => 
  `${index + 1}. ${pkg.type} - ${pkg.length}×${pkg.width}×${pkg.height}cm - ${pkg.weight}kg (×${pkg.quantity})`
).join('\n')}

Généré par Logidoo - Module Aide au Chargement
    `;

    // Create and download the file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-chargement-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // CSV export simulation
    const csvData = [
      ['Type', 'Longueur (cm)', 'Largeur (cm)', 'Hauteur (cm)', 'Poids (kg)', 'Quantité'],
      ...packages.map(pkg => [
        pkg.type,
        pkg.length.toString(),
        pkg.width.toString(),
        pkg.height.toString(),
        pkg.weight.toString(),
        pkg.quantity.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const hasData = packages.length > 0 && container;

  return (
    <Card className="shadow-card-logistics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Download className="h-5 w-5" />
          Export et partage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={generatePDFReport}
          disabled={!hasData}
          className="w-full justify-start bg-gradient-primary hover:opacity-90"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exporter en PDF
          <span className="ml-auto text-xs opacity-75">Plan complet</span>
        </Button>

        <Button
          onClick={exportToExcel}
          disabled={packages.length === 0}
          variant="outline"
          className="w-full justify-start"
        >
          <Table className="h-4 w-4 mr-2" />
          Exporter les colis (CSV)
          <span className="ml-auto text-xs opacity-75">Liste détaillée</span>
        </Button>

        {!hasData && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Ajoutez des colis et sélectionnez un contenant pour activer l'export
          </p>
        )}
      </CardContent>
    </Card>
  );
};