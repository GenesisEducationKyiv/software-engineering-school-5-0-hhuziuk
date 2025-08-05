import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { Subscription } from "../../domain/entities/subscription.entity";
import { TemplateType } from "../dto/templates.enum";
import { config } from "@/shared/configs/config";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

@Injectable()
export class ConfirmEmailService {
  constructor(
    @Inject("EMAIL_SERVICE") private readonly emailClient: ClientProxy,
    private readonly logger: WinstonLogger,
  ) {}

  async sendConfirmationEmail(subscription: Subscription, token: string): Promise<void> {
    const payload = {
      email: subscription.email,
      subject: "Welcome! Confirm your weather subscription",
      template: TemplateType.CONFIRM,
      context: {
        city: subscription.city,
        confirmUrl: `${config.app.baseUrl}/api/confirm/${token}`,
        unsubscribeUrl: `${config.app.baseUrl}/api/unsubscribe/${token}`,
      },
    };

    this.logger.log(`[ConfirmEmailService] Emitting send_email → to=${payload.email}`);

    try {
      await lastValueFrom(this.emailClient.emit("send_email", payload));
      this.logger.log(
        `[ConfirmEmailService] send_email emitted successfully → to=${payload.email}`,
      );
    } catch (err) {
      this.logger.error(
        `[ConfirmEmailService] Failed to emit send_email → to=${payload.email}`,
        err,
      );
      throw err;
    }
  }
}
