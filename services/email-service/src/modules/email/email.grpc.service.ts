import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { EmailService } from "./email.service";
import { SendEmailDto } from "@/modules/email/dto/send-email.dto";

@Controller()
export class EmailGrpcService {
  constructor(private readonly emailService: EmailService) {}

  @GrpcMethod("EmailService", "Send")
  async sendEmail(data: SendEmailDto): Promise<{ success: boolean }> {
    await this.emailService.send(data);
    return { success: true };
  }
}
