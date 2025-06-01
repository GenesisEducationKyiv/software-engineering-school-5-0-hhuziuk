import "reflect-metadata";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { config } from "@/shared/configs/config";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );

  app.enableCors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.setGlobalPrefix("api");
  await app.listen(config.port, "0.0.0.0");
}

bootstrap();
