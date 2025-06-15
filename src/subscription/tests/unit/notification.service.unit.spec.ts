import { NotificationService } from "@/subscription/application/services/notification.service";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { NotificationStrategy } from "@/subscription/application/services/interfaces/notification-strategy.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { MailerService } from "@nestjs-modules/mailer";
import { WeatherService } from "@/weather/application/services/weather.service";
import { EmailContext } from "@/subscription/application/services/interfaces/types.interface";

describe("NotificationService", () => {
  let service: NotificationService;
  let weatherService: jest.Mocked<WeatherService>;
  let queryRepo: jest.Mocked<SubscriptionQueryRepository>;
  let mailer: jest.Mocked<MailerService>;

  const dailyStrategy: jest.Mocked<NotificationStrategy> = {
    frequency: UpdateFrequency.DAILY,
    buildContext: jest.fn(),
    getSubject: jest.fn().mockReturnValue("Daily Subject"),
    getTemplate: jest.fn().mockReturnValue("daily-template"),
  };

  const hourlyStrategy: jest.Mocked<NotificationStrategy> = {
    frequency: UpdateFrequency.HOURLY,
    buildContext: jest.fn(),
    getSubject: jest.fn().mockReturnValue("Hourly Subject"),
    getTemplate: jest.fn().mockReturnValue("hourly-template"),
  };

  beforeEach(() => {
    weatherService = {
      getCurrent: jest.fn(),
    } as any;

    queryRepo = {
      findConfirmedByFrequency: jest.fn(),
    } as any;

    mailer = {
      sendMail: jest.fn(),
    } as any;

    service = new NotificationService(weatherService, queryRepo, mailer, [
      dailyStrategy,
      hourlyStrategy,
    ]);
  });

  it("sends emails for DAILY subscriptions", async () => {
    const subs = [
      { email: "a@b.com", city: "CityA" },
      { email: "c@d.com", city: "CityB" },
    ];

    const weather = {
      city: "CityA",
      temperature: 10,
      humidity: 50,
      description: "Sunny",
      fetchedAt: new Date(),
    };

    queryRepo.findConfirmedByFrequency.mockResolvedValue(subs as any);
    weatherService.getCurrent.mockResolvedValue(weather);

    dailyStrategy.buildContext.mockImplementation((sub, w) => ({
      greeting: `Hello ${sub.city}`,
      city: sub.city,
      unsubscribeUrl: `https://unsubscribe/${sub.city}`,
      weather: w,
    }));

    await service.sendBatch(UpdateFrequency.DAILY);

    expect(queryRepo.findConfirmedByFrequency).toHaveBeenCalledWith(UpdateFrequency.DAILY);
    expect(weatherService.getCurrent).toHaveBeenCalledTimes(2);
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityA");
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityB");
    expect(dailyStrategy.buildContext).toHaveBeenCalledTimes(2);
    expect(dailyStrategy.getSubject).toHaveBeenCalled();
    expect(dailyStrategy.getTemplate).toHaveBeenCalled();

    expect(mailer.sendMail).toHaveBeenCalledTimes(2);
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "a@b.com",
        subject: "Daily Subject",
        template: "daily-template",
        context: expect.objectContaining({
          city: "CityA",
          greeting: "Hello CityA",
          unsubscribeUrl: "https://unsubscribe/CityA",
        }),
      }),
    );
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "c@d.com",
        subject: "Daily Subject",
        template: "daily-template",
        context: expect.objectContaining({
          city: "CityB",
          greeting: "Hello CityB",
          unsubscribeUrl: "https://unsubscribe/CityB",
        }),
      }),
    );
  });

  it("sends email using HOURLY strategy", async () => {
    const subs = [{ email: "x@y.com", city: "CityX" }];
    const weather = {
      city: "CityX",
      temperature: 5,
      humidity: 80,
      description: "Cloudy",
      fetchedAt: new Date(),
    };

    queryRepo.findConfirmedByFrequency.mockResolvedValue(subs as any);
    weatherService.getCurrent.mockResolvedValue(weather);

    hourlyStrategy.buildContext.mockReturnValue({
      greeting: "Hi there",
      city: "CityX",
      unsubscribeUrl: "https://unsubscribe/CityX",
      weather,
    });

    await service.sendBatch(UpdateFrequency.HOURLY);

    expect(queryRepo.findConfirmedByFrequency).toHaveBeenCalledWith(UpdateFrequency.HOURLY);
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityX");
    expect(hourlyStrategy.getSubject).toHaveBeenCalled();
    expect(hourlyStrategy.getTemplate).toHaveBeenCalled();
    expect(hourlyStrategy.buildContext).toHaveBeenCalledWith(subs[0], weather);

    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "x@y.com",
        subject: "Hourly Subject",
        template: "hourly-template",
        context: expect.objectContaining({
          city: "CityX",
          greeting: "Hi there",
          unsubscribeUrl: "https://unsubscribe/CityX",
        }),
      }),
    );
  });

  it("throws if no strategy for frequency", async () => {
    await expect(service.sendBatch(-1 as unknown as UpdateFrequency)).rejects.toThrow(
      "No notification strategy for frequency -1",
    );
  });
});
