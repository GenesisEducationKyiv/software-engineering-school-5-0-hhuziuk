import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionService } from "@/subscription/application/services/subscription.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SUBSCRIPTION_COMMAND_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-command.repository.interface";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { CreateSubscriptionDto } from "@/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "@/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "@/weather/application/dto/unsubscribe.dto";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { TokenService } from "@/subscription/application/services/token.service";
import { SubscriptionManager } from "@/subscription/application/services/subscription-manager.service";
import { NotificationService } from "@/subscription/application/services/notification.service";

jest.mock("@/shared/configs/config", () => ({
  config: {
    app: {
      baseUrl: "https://example.com",
      port: 3000,
    },
    mail: {
      from: "no-reply@example.com",
    },
    weather: {
      apiKey: "mock-weather-api-key",
    },
  },
}));

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  let queryRepoMock: any;
  let commandRepoMock: any;
  let mailerMock: MailerService;
  let tokenServiceMock: TokenService;
  let subscriptionManagerMock: SubscriptionManager;
  let notificationServiceMock: NotificationService;

  const mockSubscriptionData = {
    id: "test-id",
    email: "a@b.com",
    city: "City",
    frequency: UpdateFrequency.DAILY,
    confirmed: false,
    token: "test-token",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    queryRepoMock = {
      findByToken: jest.fn(),
    };
    commandRepoMock = {
      confirmSubscription: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: SUBSCRIPTION_QUERY_REPOSITORY, useValue: queryRepoMock },
        { provide: SUBSCRIPTION_COMMAND_REPOSITORY, useValue: commandRepoMock },
        { provide: MailerService, useValue: { sendMail: jest.fn() } },
        {
          provide: TokenService,
          useValue: {
            generate: jest.fn().mockReturnValue("mock-generated-token"),
            getConfirmUrl: jest.fn().mockReturnValue("mock-confirm-url"),
            getUnsubscribeUrl: jest.fn().mockReturnValue("mock-unsubscribe-url"),
          },
        },
        {
          provide: SubscriptionManager,
          useValue: {
            subscribe: jest.fn(),
            confirm: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendBatch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    mailerMock = module.get<MailerService>(MailerService);
    tokenServiceMock = module.get<TokenService>(TokenService);
    subscriptionManagerMock = module.get<SubscriptionManager>(SubscriptionManager);
    notificationServiceMock = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("subscribe", () => {
    const dto: CreateSubscriptionDto = {
      email: "a@b.com",
      city: "City",
      frequency: UpdateFrequency.DAILY,
    };

    it("should call tokenService, subscriptionManager, and mailerService on successful subscription", async () => {
      (subscriptionManagerMock.subscribe as jest.Mock).mockResolvedValue({
        ...mockSubscriptionData,
        email: dto.email,
        city: dto.city,
        frequency: dto.frequency,
      });

      await service.subscribe(dto);

      expect(tokenServiceMock.generate).toHaveBeenCalled();
      expect(subscriptionManagerMock.subscribe).toHaveBeenCalledWith(dto, "mock-generated-token");
      expect(mailerMock.sendMail).toHaveBeenCalled();
    });

    it("should propagate ConflictException from subscriptionManager and not send email", async () => {
      (subscriptionManagerMock.subscribe as jest.Mock).mockRejectedValueOnce(
        new ConflictException("Email already subscribed"),
      );

      await expect(service.subscribe(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(mailerMock.sendMail).not.toHaveBeenCalled();
    });
  });

  describe("confirm", () => {
    const dto: ConfirmSubscriptionDto = { token: "token" };

    it("should throw NotFoundException if token invalid", async () => {
      queryRepoMock.findByToken.mockResolvedValue(null);

      await expect(service.confirm(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should not call confirmSubscription if already confirmed", async () => {
      queryRepoMock.findByToken.mockResolvedValue({
        ...mockSubscriptionData,
        confirmed: true,
      });

      await service.confirm(dto);
      expect(commandRepoMock.confirmSubscription).not.toHaveBeenCalled();
    });

    it("should confirm subscription if not confirmed", async () => {
      queryRepoMock.findByToken.mockResolvedValue({
        ...mockSubscriptionData,
        confirmed: false,
      });

      await service.confirm(dto);
      expect(subscriptionManagerMock.confirm).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("unsubscribe", () => {
    const dto: UnsubscribeDto = { token: "token" };

    it("should throw NotFoundException if token invalid", async () => {
      queryRepoMock.findByToken.mockResolvedValue(null);
      await expect(service.unsubscribe(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should call unsubscribe on repo", async () => {
      queryRepoMock.findByToken.mockResolvedValue({ ...mockSubscriptionData });

      await service.unsubscribe(dto);
      expect(subscriptionManagerMock.unsubscribe).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("cron jobs (handleDailyNotifications / handleHourlyNotifications)", () => {
    it("handleDailyNotifications should call notificationService.sendBatch with DAILY", async () => {
      await service.handleDailyNotifications();
      expect(notificationServiceMock.sendBatch).toHaveBeenCalledWith(UpdateFrequency.DAILY);
    });

    it("handleHourlyNotifications should call notificationService.sendBatch with HOURLY", async () => {
      await service.handleHourlyNotifications();
      expect(notificationServiceMock.sendBatch).toHaveBeenCalledWith(UpdateFrequency.HOURLY);
    });
  });
});
