import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";
import logger, { setConsoleLogs, setFileLogs, setMetricsLogs } from "@/shared/logger/logger";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ["amqp://guest:guest@rabbitmq:5672"],
      queue: "email_queue",
      queueOptions: { durable: false },
    },
  });
  app.useLogger(new WinstonLogger(logger));
  await app.listen();
}

(async () => {
  setFileLogs(logger, "./logs");
  setMetricsLogs(logger, "./metrics");
  setConsoleLogs(logger);
  await bootstrap();
})();
