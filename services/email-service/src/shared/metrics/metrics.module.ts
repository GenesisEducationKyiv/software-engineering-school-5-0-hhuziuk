import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { HttpMetricsInterceptor } from "@/shared/metrics/http-metrics.interceptor";
import { RED_METRICS_PROVIDERS } from "@/shared/metrics/red-metrics.providers";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    ...RED_METRICS_PROVIDERS,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  exports: [],
})
export class MetricsModule {}
