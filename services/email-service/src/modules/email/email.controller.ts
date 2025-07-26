import { Body, Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("send")
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ success: boolean }> {
    await this.emailService.send(dto);
    return { success: true };
  }
}
