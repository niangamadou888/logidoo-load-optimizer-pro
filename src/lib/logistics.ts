import { Package, Container, LoadingStats } from '@/types/logistics';

export const calculatePackageVolume = (pkg: Package): number => {
  return (pkg.length * pkg.width * pkg.height * pkg.quantity) / 1000000; // Convert cm³ to m³
};

export const calculateTotalVolume = (packages: Package[]): number => {
  return packages.reduce((total, pkg) => total + calculatePackageVolume(pkg), 0);
};

export const calculateTotalWeight = (packages: Package[]): number => {
  return packages.reduce((total, pkg) => total + (pkg.weight * pkg.quantity), 0);
};

export const calculateContainerVolume = (container: Container): number => {
  return (container.length * container.width * container.height) / 1000000; // Convert cm³ to m³
};

export const calculateLoadingStats = (packages: Package[], container: Container): LoadingStats => {
  const totalVolume = calculateTotalVolume(packages);
  const totalWeight = calculateTotalWeight(packages);
  const containerVolume = calculateContainerVolume(container);
  const containerMaxWeight = container.maxWeight;

  const volumeUtilization = containerVolume > 0 ? (totalVolume / containerVolume) * 100 : 0;
  const weightUtilization = containerMaxWeight > 0 ? (totalWeight / containerMaxWeight) * 100 : 0;

  return {
    totalVolume,
    totalWeight,
    containerVolume,
    containerMaxWeight,
    volumeUtilization: Math.round(volumeUtilization * 100) / 100,
    weightUtilization: Math.round(weightUtilization * 100) / 100,
    remainingVolume: Math.max(0, containerVolume - totalVolume),
    remainingWeight: Math.max(0, containerMaxWeight - totalWeight)
  };
};

export const standardContainers: Container[] = [
  {
    id: 'container-20ft',
    name: 'Conteneur 20 pieds',
    type: 'container',
    length: 589,
    width: 235,
    height: 239,
    maxWeight: 28230
  },
  {
    id: 'container-40ft',
    name: 'Conteneur 40 pieds',
    type: 'container',
    length: 1203,
    width: 235,
    height: 239,
    maxWeight: 26760
  },
  {
    id: 'truck-small',
    name: 'Camion 3.5T',
    type: 'truck',
    length: 420,
    width: 180,
    height: 180,
    maxWeight: 3500
  },
  {
    id: 'truck-medium',
    name: 'Camion 7.5T',
    type: 'truck',
    length: 620,
    width: 240,
    height: 240,
    maxWeight: 7500
  },
  {
    id: 'truck-large',
    name: 'Camion 19T',
    type: 'truck',
    length: 1360,
    width: 248,
    height: 270,
    maxWeight: 19000
  }
];

export const suggestOptimalContainer = (packages: Package[]): Container => {
  const totalVolume = calculateTotalVolume(packages);
  const totalWeight = calculateTotalWeight(packages);
  
  // Find the smallest container that can fit everything
  const suitableContainers = standardContainers.filter(container => {
    const containerVolume = calculateContainerVolume(container);
    return containerVolume >= totalVolume && container.maxWeight >= totalWeight;
  });

  if (suitableContainers.length === 0) {
    // Return largest container if nothing fits
    return standardContainers[standardContainers.length - 1];
  }

  // Sort by volume efficiency (closest to optimal fill)
  return suitableContainers.sort((a, b) => {
    const aVolume = calculateContainerVolume(a);
    const bVolume = calculateContainerVolume(b);
    const aEfficiency = totalVolume / aVolume;
    const bEfficiency = totalVolume / bVolume;
    return bEfficiency - aEfficiency;
  })[0];
};