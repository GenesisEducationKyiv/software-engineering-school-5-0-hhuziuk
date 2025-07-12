import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsService } from "../../modules/weather/infrastructure/metrics/metrics.service";

@Module({
  imports: [PrometheusModule.register()],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
