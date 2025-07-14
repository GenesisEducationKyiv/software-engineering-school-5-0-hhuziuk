import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Subscription } from "@/subscription/domain/entities/subscription.entity";
import { TokenService } from "@/subscription/application/services/token.service";

@Injectable()
export class ConfirmEmailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async sendConfirmationEmail(subscription: Subscription, token: string): Promise<void> {
    await this.mailer.sendMail({
      to: subscription.email,
      subject: "Welcome! Confirm your weather subscription",
      template: "confirm-subscription",
      context: {
        city: subscription.city,
        confirmUrl: this.tokenService.getConfirmUrl(token),
        unsubscribeUrl: this.tokenService.getUnsubscribeUrl(token),
      },
    });
  }
}
