export interface Package {
  id: string;
  type: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  volume?: number;
}

export interface Container {
  id: string;
  name: string;
  type: 'container' | 'truck';
  length: number;
  width: number;
  height: number;
  maxWeight: number;
  volume?: number;
}

export interface LoadingStats {
  totalVolume: number;
  totalWeight: number;
  containerVolume: number;
  containerMaxWeight: number;
  volumeUtilization: number;
  weightUtilization: number;
  remainingVolume: number;
  remainingWeight: number;
}

export interface LoadingPlan {
  id: string;
  name: string;
  packages: Package[];
  container: Container;
  stats: LoadingStats;
  createdAt: Date;
}