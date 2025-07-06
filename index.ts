import "reflect-metadata";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { config } from "@/shared/configs/config";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import logger, { setConsoleLogs, setFileLogs, setMetricsLogs } from "@/shared/logger/logger";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({ logger: false });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter);

  app.useLogger(new WinstonLogger(logger));

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  app.setGlobalPrefix("api");

  await app.listen(config.port, "0.0.0.0");
}

(async () => {
  setFileLogs(logger, "./logs");
  setMetricsLogs(logger, "./metrics");
  setConsoleLogs(logger);

  await bootstrap();
})();
