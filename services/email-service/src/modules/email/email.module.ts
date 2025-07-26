import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { EmailGrpcService } from "@/modules/email/email.grpc.service";
import { RmqEmailListener } from "@/modules/email/email-message-consumer";

@Module({
  controllers: [EmailController, EmailGrpcService, RmqEmailListener],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
