import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

async function bootstrapGrpc() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: "0.0.0.0:50051",
      package: "email",
      protoPath: join(process.cwd(), "proto/email.proto"),
    },
  });

  await app.listen();
  console.log(`gRPC Email service listening on 0.0.0.0:50051`);
}

bootstrapGrpc();
