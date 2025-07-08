import { Injectable } from "@nestjs/common";
import { Counter, Histogram } from "prom-client";

@Injectable()
export class MetricsService {
  public cacheHits: Counter<string>;
  public cacheMisses: Counter<string>;
  public cacheLatency: Histogram<string>;

  constructor() {
    this.cacheHits = new Counter({
      name: "app_cache_hits_total",
      help: "Total number of cache hits",
      labelNames: ["key"],
    });
    this.cacheMisses = new Counter({
      name: "app_cache_misses_total",
      help: "Total number of cache misses",
      labelNames: ["key"],
    });
    this.cacheLatency = new Histogram({
      name: "app_cache_latency_seconds",
      help: "Latency of cache operations in seconds",
      buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1],
      labelNames: ["operation", "key"],
    });
  }
}
