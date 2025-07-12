import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GrpcEmailClientService } from "./grpc-email.client";
import { join } from "node:path";
import {config} from "@/shared/configs/config";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: "EMAIL_PACKAGE",
                transport: Transport.GRPC,
                options: {
                    url: config.grpc.emailServiceGrpcUrl || "localhost:50051",
                    package: "email",
                    protoPath: join(process.cwd(), "proto/email.proto"),
                },
            },
        ]),
    ],
    providers: [GrpcEmailClientService],
    exports: [GrpcEmailClientService],
})
export class GrpcEmailModule {}
