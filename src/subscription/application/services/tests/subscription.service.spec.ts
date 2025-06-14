import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionService } from "@/subscription/application/services/subscription.service";
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from "@/subscription/infrastructure/repositories/subscription.repository.interface";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { CreateSubscriptionDto } from "@/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "@/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "@/weather/application/dto/unsubscribe.dto";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { TokenService } from "@/subscription/application/services/token.service";
import { SubscriptionManager } from "@/subscription/application/services/subscription-manager.service";
import { NotificationService } from "@/subscription/application/services/notification.service";

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  let repoMock: ISubscriptionRepository;
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: {
            findByToken: jest.fn(),
            confirmSubscription: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
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
    repoMock = module.get<ISubscriptionRepository>(SUBSCRIPTION_REPOSITORY);
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
    const generatedToken = "mock-generated-token";
    const confirmUrl = "mock-confirm-url";
    const unsubscribeUrl = "mock-unsubscribe-url";

    const successfulSubscription: {
      id: string;
      email: string;
      city: string;
      frequency: UpdateFrequency;
      confirmed: boolean;
      token: string;
      createdAt: Date;
    } = {
      ...mockSubscriptionData,
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
      token: generatedToken,
    };

    it("should call tokenService, subscriptionManager, and mailerService on successful subscription", async () => {
      (subscriptionManagerMock.subscribe as jest.Mock).mockResolvedValue(successfulSubscription);

      await service.subscribe(dto);

      expect(tokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(subscriptionManagerMock.subscribe).toHaveBeenCalledWith(dto, generatedToken);
      expect(mailerMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: dto.email,
          subject: "Welcome! Confirm your weather subscription",
          template: "confirm-subscription",
          context: {
            city: successfulSubscription.city,
            confirmUrl: confirmUrl,
            unsubscribeUrl: unsubscribeUrl,
          },
        }),
      );
    });

    it("should propagate ConflictException from subscriptionManager and not send email", async () => {
      (subscriptionManagerMock.subscribe as jest.Mock).mockRejectedValueOnce(
        new ConflictException("Email already subscribed"),
      );

      await expect(service.subscribe(dto)).rejects.toBeInstanceOf(ConflictException);

      expect(tokenServiceMock.generate).toHaveBeenCalledTimes(1);
      expect(subscriptionManagerMock.subscribe).toHaveBeenCalledWith(dto, generatedToken);
      expect(mailerMock.sendMail).not.toHaveBeenCalled();
    });
  });

  describe("confirm", () => {
    it("should throw NotFoundException if token invalid", async () => {
      (repoMock.findByToken as jest.Mock).mockResolvedValue(null);
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await expect(service.confirm(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should not call confirmSubscription if already confirmed", async () => {
      (repoMock.findByToken as jest.Mock).mockResolvedValue({
        ...mockSubscriptionData,
        confirmed: true,
      });
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await service.confirm(dto);
      expect(repoMock.confirmSubscription).not.toHaveBeenCalled();
    });

    it("should confirm subscription if not confirmed", async () => {
      (repoMock.findByToken as jest.Mock).mockResolvedValue({
        ...mockSubscriptionData,
        confirmed: false,
      });
      const dto: ConfirmSubscriptionDto = { token: "token" };
      await service.confirm(dto);
      expect(repoMock.confirmSubscription).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("unsubscribe", () => {
    it("should throw NotFoundException if token invalid", async () => {
      (repoMock.findByToken as jest.Mock).mockResolvedValue(null);
      const dto: UnsubscribeDto = { token: "token" };
      await expect(service.unsubscribe(dto)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("should call unsubscribe on repo", async () => {
      (repoMock.findByToken as jest.Mock).mockResolvedValue({ ...mockSubscriptionData });
      const dto: UnsubscribeDto = { token: "token" };
      await service.unsubscribe(dto);
      expect(repoMock.unsubscribe).toHaveBeenCalledWith(dto.token);
    });
  });

  describe("cron jobs (handleDailyNotifications / handleHourlyNotifications)", () => {
    it("handleDailyNotifications should call notificationService.sendBatch with DAILY frequency", async () => {
      await service.handleDailyNotifications();
      expect(notificationServiceMock.sendBatch).toHaveBeenCalledWith(UpdateFrequency.DAILY);
    });

    it("handleHourlyNotifications should call notificationService.sendBatch with HOURLY frequency", async () => {
      await service.handleHourlyNotifications();
      expect(notificationServiceMock.sendBatch).toHaveBeenCalledWith(UpdateFrequency.HOURLY);
    });
  });
});
