import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SendEmailDto } from "./dto/send-email.dto";

@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) {}

  async send(dto: SendEmailDto): Promise<void> {
    await this.mailer.sendMail({
      to: dto.email,
      subject: dto.subject,
      template: dto.template,
      context: dto.context,
    });
  }
}
