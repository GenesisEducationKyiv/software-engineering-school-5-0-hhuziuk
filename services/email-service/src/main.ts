import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./shared/configs/config";

async function bootstrapHttp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("email");
  await app.listen(config.port, "0.0.0.0");
  console.log(`HTTP Email service listening on http://0.0.0.0:${config.port}/email`);
}

bootstrapHttp();
