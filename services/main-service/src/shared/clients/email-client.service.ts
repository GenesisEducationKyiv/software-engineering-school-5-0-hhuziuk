import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { config } from "@/shared/configs/config";

export type EmailTemplateContext = {
  greeting: string;
  city: string;
  unsubscribeUrl: string;
  weather: {
    temperature: number;
    humidity: number;
    description: string;
  };
};

@Injectable()
export class EmailClientService {
  constructor(private readonly http: HttpService) {}

  async sendEmail(payload: {
    to: string;
    subject: string;
    template: string;
    context: EmailTemplateContext;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${config.emailServiceBaseUrl}/email`, payload));
  }
}
