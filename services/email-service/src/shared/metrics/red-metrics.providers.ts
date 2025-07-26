import { makeCounterProvider, makeHistogramProvider } from "@willsoto/nestjs-prometheus";

export const RED_METRICS_PROVIDERS = [
  makeCounterProvider({
    name: "http_request_count",
    help: "Total number of HTTP requests",
    labelNames: ["method", "path"],
  }),
  makeCounterProvider({
    name: "http_request_errors_total",
    help: "Total number of failed HTTP requests",
    labelNames: ["method", "path", "status"],
  }),
  makeHistogramProvider({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "path", "status"],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
  }),
];
