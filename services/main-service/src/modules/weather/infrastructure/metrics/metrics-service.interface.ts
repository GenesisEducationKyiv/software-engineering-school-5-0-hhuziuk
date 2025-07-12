import { Counter, Histogram } from "prom-client";

export const METRICS_SERVICE_INTERFACE = Symbol("IMetricsService");

export interface IMetricsService {
  cacheRequests: Counter<string>;
  cacheLatency: Histogram<string>;
}
