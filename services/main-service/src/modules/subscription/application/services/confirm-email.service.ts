import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Subscription } from "../../domain/entities/subscription.entity";
import { TemplateType } from "../dto/templates.enum";
import { config } from "@/shared/configs/config";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ConfirmEmailService {
  constructor(@Inject("EMAIL_SERVICE") private readonly emailClient: ClientProxy) {}

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

    await lastValueFrom(this.emailClient.emit("send_email", payload));
  }
}
