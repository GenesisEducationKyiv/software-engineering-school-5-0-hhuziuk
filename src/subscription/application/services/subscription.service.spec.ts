import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionService } from "src/subscription/application/services/subscription.service";
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { MailerService } from "@nestjs-modules/mailer";
import { WeatherService } from "src/weather/application/services/weather.service";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "src/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "src/weather/application/dto/unsubscribe.dto";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  let repo: ISubscriptionRepository;
  let mailer: MailerService;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: {
            isEmailSubscribed: jest.fn(),
            create: jest.fn(),
            findByToken: jest.fn(),
            confirmSubscription: jest.fn(),
            unsubscribe: jest.fn(),
            findConfirmedByFrequency: jest.fn(),
          },
        },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
        { provide: WeatherService, useValue: { getCurrent: jest.fn() } },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get<ISubscriptionRepository>(SUBSCRIPTION_REPOSITORY);
    mailer = module.get<MailerService>(MailerService);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  describe("subscribe", () => {
    it("should throw ConflictException if already subscribed", async () => {
      (repo.isEmailSubscribed as jest.Mock).mockResolvedValue(true);
      const dto: CreateSubscriptionDto = {
        email: "a@b.com",
        city: "City",
        frequency: UpdateFrequency.DAILY,
      };
      await expect(service.subscribe(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it("should create subscription and send confirmation email", async () => {
      (repo.isEmailSubscribed as jest.Mock).mockResolvedValue(false);
      const dto: CreateSubscriptionDto = {
        email: "a@b.com",
        city: "City",
        frequency: UpdateFrequency.HOURLY,
      };

      await service.subscribe(dto);

      expect(repo.create).toHaveBeenCalled();
      expect(mailer.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: dto.email,
          template: "confirm-subscription",
        }),
      );
    });
  });

  describe("confirm", () => {
    it("should throw NotFoundException if token invalid", async () => {
      (repo.findByToken as jest.Mock).mockResolvedValue(null);
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await expect(service.confirm(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should not call confirmSubscription if already confirmed", async () => {
      (repo.findByToken as jest.Mock).mockResolvedValue({ confirmed: true });
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await service.confirm(dto);
      expect(repo.confirmSubscription).not.toHaveBeenCalled();
    });

    it("should confirm subscription if not confirmed", async () => {
      (repo.findByToken as jest.Mock).mockResolvedValue({ confirmed: false });
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await service.confirm(dto);
      expect(repo.confirmSubscription).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("unsubscribe", () => {
    it("should throw NotFoundException if token invalid", async () => {
      (repo.findByToken as jest.Mock).mockResolvedValue(null);
      const dto: UnsubscribeDto = { token: "token" };
      await expect(service.unsubscribe(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should call unsubscribe on repo", async () => {
      (repo.findByToken as jest.Mock).mockResolvedValue({});
      const dto: UnsubscribeDto = { token: "token" };
      await service.unsubscribe(dto);
      expect(repo.unsubscribe).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("sendBatch", () => {
    it("should fetch weather and send emails for daily frequency", async () => {
      const subs = [{ email: "a@b.com", city: "City", frequency: UpdateFrequency.DAILY }];
      (repo.findConfirmedByFrequency as jest.Mock).mockResolvedValue(subs);
      (weatherService.getCurrent as jest.Mock).mockResolvedValue({
        temperature: 10,
        humidity: 50,
        description: "Desc",
      });

      await (service as any).sendBatch(UpdateFrequency.DAILY);

      expect(weatherService.getCurrent).toHaveBeenCalledWith({ city: "City" });
      expect(mailer.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "a@b.com",
          template: "daily-subscription",
        }),
      );
    });

    it("should use hourly template for hourly frequency", async () => {
      const subs = [{ email: "c@d.com", city: "Other", frequency: UpdateFrequency.HOURLY }];
      (repo.findConfirmedByFrequency as jest.Mock).mockResolvedValue(subs);
      (weatherService.getCurrent as jest.Mock).mockResolvedValue({
        temperature: 5,
        humidity: 80,
        description: "Desc",
      });

      await (service as any).sendBatch(UpdateFrequency.HOURLY);

      expect(mailer.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "c@d.com",
          template: "hourly-subscription",
        }),
      );
    });
  });
});
