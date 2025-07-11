import { Injectable } from "@nestjs/common";
import { Counter, Histogram } from "prom-client";
import { IMetricsService } from "@/weather/infrastructure/metrics/metrics-service.interface";

@Injectable()
export class MetricsService implements IMetricsService {
  public cacheRequests: Counter<string>;
  public cacheLatency: Histogram<string>;

  constructor() {
    this.cacheRequests = new Counter({
      name: "app_cache_requests_total",
      help: "Total number of cache requests labeled by hit/miss",
      labelNames: ["status", "city"],
    });

    this.cacheLatency = new Histogram({
      name: "app_cache_latency_seconds",
      help: "Latency of cache operations in seconds",
      buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1],
      labelNames: ["operation", "city"],
    });
  }
}
