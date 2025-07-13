import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { EmailGrpcService } from "@/modules/email/email.grpc.service";

@Module({
  controllers: [EmailController, EmailGrpcService],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
