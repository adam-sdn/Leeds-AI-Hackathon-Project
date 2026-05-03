export type HealthMetrics = {
  heartRate: string;
  sleep: string;
  activity: string;
  recovery: string;
  hrv: string;
  steps: string;
};

export type ConnectedHealthData = {
  brand: string;
  demo: boolean;
  metrics: HealthMetrics;
};
