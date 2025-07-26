import { Controller } from "@nestjs/common";
import { EventPattern, Payload, Ctx, RmqContext } from "@nestjs/microservices";
import { EmailService } from "./email.service";
import { SendEmailDto } from "./dto/send-email.dto";
import { WinstonLogger } from "../../shared/logger/winston-logger.service";

@Controller()
export class RmqEmailListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: WinstonLogger,
  ) {}

  @EventPattern("send_email")
  async handleSendEmail(@Payload() payload: SendEmailDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(
      `[RMQ] Received send_email event → email=${payload.email} subject=${payload.subject}`,
    );

    try {
      await this.emailService.send(payload);
      this.logger.log(`[RMQ] Email successfully sent → email=${payload.email}`);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`[RMQ] Failed to send email → email=${payload.email}`, err);
      channel.nack(originalMsg, false, false);
    }
  }
}
