import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { EmailGrpcService } from "@/modules/email/email.grpc.service";
import { RmqEmailListener } from "@/modules/email/email-message-consumer";
import { MailerService } from "@nestjs-modules/mailer";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

@Module({
  imports: [],
  controllers: [EmailController, EmailGrpcService, RmqEmailListener],
  providers: [
    EmailService,
    WinstonLogger,
    { provide: MailerService, useValue: { sendMail: async () => {} } },
  ],
  exports: [EmailService],
})
export class EmailModule {}
