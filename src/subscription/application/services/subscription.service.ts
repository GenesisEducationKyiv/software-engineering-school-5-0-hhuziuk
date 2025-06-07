import { Injectable, Inject, ConflictException, NotFoundException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { Subscription } from "src/subscription/domain/entities/subscription.entity";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "src/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "src/weather/application/dto/unsubscribe.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { Cron } from "@nestjs/schedule";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";
import { config } from "src/shared/configs/config";
import { WeatherService } from "src/weather/application/services/weather.service";
import { EmailContext } from "@/subscription/application/services/types";

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repo: ISubscriptionRepository,
    private readonly mailer: MailerService,
    private readonly weatherService: WeatherService,
  ) {}

  @Cron("0 8 * * *", { timeZone: "Europe/Warsaw" })
  async handleDailyNotifications() {
    await this.sendBatch(UpdateFrequency.DAILY);
  }

  @Cron("0 * * * *", { timeZone: "Europe/Warsaw" })
  async handleHourlyNotifications() {
    await this.sendBatch(UpdateFrequency.HOURLY);
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<void> {
    const isSubbed = await this.repo.isEmailSubscribed(dto.email, dto.city);
    if (isSubbed) {
      throw new ConflictException("Email already subscribed");
    }
    const token = uuidv4();
    await this.repo.create(
      new Subscription(uuidv4(), dto.email, dto.city, dto.frequency, false, token, new Date()),
    );

    const confirmUrl = `${config.app.baseUrl}/api/confirm/${token}`;
    const unsubscribeUrl = `${config.app.baseUrl}/api/unsubscribe/${token}`;
    await this.mailer.sendMail({
      to: dto.email,
      subject: "Welcome! Confirm your weather subscription",
      template: "confirm-subscription",
      context: {
        city: dto.city,
        confirmUrl,
        unsubscribeUrl,
      },
    });
  }

  async confirm(dto: ConfirmSubscriptionDto): Promise<void> {
    const sub = await this.repo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");
    if (sub.confirmed) return;
    await this.repo.confirmSubscription(dto.token);
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    const sub = await this.repo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");
    await this.repo.unsubscribe(dto.token);
  }

  private async sendBatch(frequency: UpdateFrequency) {
    const subs = await this.repo.findConfirmedByFrequency(frequency);
    for (const sub of subs) {
      const weather = await this.weatherService.getCurrent({ city: sub.city });
      const unsubscribeUrl = `${config.app.baseUrl}/api/unsubscribe/${sub.token}`;

      const greeting = frequency === UpdateFrequency.HOURLY ? "Hour" : "Morning";

      const context: EmailContext = {
        greeting,
        city: sub.city,
        unsubscribeUrl,
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          description: weather.description,
        },
      };

      await this.mailer.sendMail({
        to: sub.email,
        subject:
          frequency === UpdateFrequency.DAILY
            ? "Your daily weather update"
            : "Your hourly weather update",
        template:
          frequency === UpdateFrequency.DAILY ? "daily-subscription" : "hourly-subscription",
        context,
      });
    }
  }
}
