import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SendEmailDto } from "./dto/send-email.dto";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

@Injectable()
export class EmailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly logger: WinstonLogger,
  ) {}

  async send(dto: SendEmailDto): Promise<void> {
    this.logger.debug(`[EmailService] Sending email → to=${dto.email}, subject=${dto.subject}`);
    await this.mailer.sendMail({
      to: dto.email,
      subject: dto.subject,
      template: dto.template,
      context: dto.context,
    });
    this.logger.debug(`[EmailService] sendMail() resolved → to=${dto.email}`);
  }
}
