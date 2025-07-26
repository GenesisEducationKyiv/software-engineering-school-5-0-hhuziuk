import { Injectable } from "@nestjs/common";
import { Subscription } from "../../domain/entities/subscription.entity";
import { HttpService } from "@nestjs/axios";
import { config } from "../../../../shared/configs/config";
import { TemplateType } from "../dto/templates.enum";
import { firstValueFrom } from "rxjs";
import { GrpcEmailClientService } from "@/modules/subscription/infrastructure/grpc/grpc-email.client";

@Injectable()
export class ConfirmEmailService {
  constructor(
    private readonly http: HttpService,
    private readonly grpcEmailClient: GrpcEmailClientService,
  ) {}

  private get baseUrl(): string {
    return config.emailServiceBaseUrl;
  }

  private get useGrpc(): boolean {
    return config.grpc.useGrpcEmail === "true";
  }

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

    if (this.useGrpc) {
      await this.grpcEmailClient.send(payload);
    } else {
      await firstValueFrom(this.http.post(`${this.baseUrl}/email/send`, payload));
    }
  }
}
