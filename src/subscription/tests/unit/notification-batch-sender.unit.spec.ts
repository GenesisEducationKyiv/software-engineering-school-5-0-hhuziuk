import { NotificationBatchSender } from "@/subscription/application/services/notification-batch-sender";
import { NotificationStrategyResolver } from "@/subscription/application/services/notification-strategy-resolver";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { WeatherService } from "@/weather/application/services/weather.service";
import { MailerService } from "@nestjs-modules/mailer";
import { NotificationStrategy } from "@/subscription/application/services/interfaces/notification-strategy.interface";

describe("NotificationBatchSender", () => {
  let sender: NotificationBatchSender;
  let weatherService: jest.Mocked<WeatherService>;
  let mailer: jest.Mocked<MailerService>;
  let queryRepo: jest.Mocked<SubscriptionQueryRepository>;
  let strategyResolver: jest.Mocked<NotificationStrategyResolver>;
  let strategyMock: jest.Mocked<NotificationStrategy>;

  beforeEach(() => {
    weatherService = {
      getCurrent: jest.fn(),
    } as any;

    mailer = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    } as any;

    queryRepo = {
      findConfirmedByFrequency: jest.fn(),
    } as any;

    strategyResolver = {
      get: jest.fn(),
    } as any;

    strategyMock = {
      frequency: UpdateFrequency.DAILY,
      buildContext: jest.fn(),
      getSubject: jest.fn().mockReturnValue("Subject"),
      getTemplate: jest.fn().mockReturnValue("template-name"),
    } as any;

    sender = new NotificationBatchSender(weatherService, mailer, strategyResolver, queryRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sends emails for all subscriptions with DAILY frequency", async () => {
    const subs = [
      { email: "a@b.com", city: "CityA" },
      { email: "c@d.com", city: "CityB" },
    ] as any[];

    queryRepo.findConfirmedByFrequency.mockResolvedValue(subs);
    const weatherA = {
      city: "CityA",
      temperature: 20,
      humidity: 30,
      description: "OK",
      fetchedAt: new Date(),
    };
    const weatherB = {
      city: "CityB",
      temperature: 15,
      humidity: 40,
      description: "Rain",
      fetchedAt: new Date(),
    };
    weatherService.getCurrent.mockResolvedValueOnce(weatherA).mockResolvedValueOnce(weatherB);

    (strategyResolver.get as jest.Mock).mockImplementation((freq) => {
      if (freq === UpdateFrequency.DAILY) return strategyMock;
      throw new Error(`Unexpected freq ${freq}`);
    });

    strategyMock.buildContext.mockImplementation((sub, weather) => ({
      greeting: `Hello ${sub.city}`,
      city: sub.city,
      unsubscribeUrl: `https://unsubscribe/${sub.city}`,
      weather,
    }));

    await sender.send(UpdateFrequency.DAILY);

    expect(queryRepo.findConfirmedByFrequency).toHaveBeenCalledWith(UpdateFrequency.DAILY);

    expect(weatherService.getCurrent).toHaveBeenCalledTimes(2);
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityA");
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityB");

    expect(strategyMock.buildContext).toHaveBeenCalledTimes(2);
    expect(strategyMock.buildContext).toHaveBeenCalledWith(subs[0], weatherA);
    expect(strategyMock.buildContext).toHaveBeenCalledWith(subs[1], weatherB);

    expect(strategyMock.getSubject).toHaveBeenCalledTimes(2);
    expect(strategyMock.getTemplate).toHaveBeenCalledTimes(2);

    expect(mailer.sendMail).toHaveBeenCalledTimes(2);
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "a@b.com",
        subject: "Subject",
        template: "template-name",
        context: expect.objectContaining({
          greeting: "Hello CityA",
          city: "CityA",
          unsubscribeUrl: "https://unsubscribe/CityA",
          weather: weatherA,
        }),
      }),
    );
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "c@d.com",
        subject: "Subject",
        template: "template-name",
        context: expect.objectContaining({
          greeting: "Hello CityB",
          city: "CityB",
          unsubscribeUrl: "https://unsubscribe/CityB",
          weather: weatherB,
        }),
      }),
    );
  });

  it("uses correct strategy from resolver for HOURLY frequency", async () => {
    const hourlySub = [{ email: "x@y.com", city: "CityX" }] as any[];
    queryRepo.findConfirmedByFrequency.mockResolvedValue(hourlySub);

    const weather = {
      city: "CityX",
      temperature: 5,
      humidity: 80,
      description: "Cloudy",
      fetchedAt: new Date(),
    };
    weatherService.getCurrent.mockResolvedValue(weather);

    const hourlyStrategyMock: jest.Mocked<NotificationStrategy> = {
      frequency: UpdateFrequency.HOURLY,
      buildContext: jest.fn().mockReturnValue({
        greeting: "Hi there",
        city: "CityX",
        unsubscribeUrl: "https://unsubscribe/CityX",
        weather,
      }),
      getSubject: jest.fn().mockReturnValue("Hourly Subject"),
      getTemplate: jest.fn().mockReturnValue("hourly-template"),
    } as any;

    (strategyResolver.get as jest.Mock).mockImplementation((freq) => {
      if (freq === UpdateFrequency.HOURLY) return hourlyStrategyMock;
      throw new Error(`No strategy for freq ${freq}`);
    });

    await sender.send(UpdateFrequency.HOURLY);

    expect(queryRepo.findConfirmedByFrequency).toHaveBeenCalledWith(UpdateFrequency.HOURLY);
    expect(weatherService.getCurrent).toHaveBeenCalledWith("CityX");
    expect(hourlyStrategyMock.buildContext).toHaveBeenCalledWith(hourlySub[0], weather);
    expect(hourlyStrategyMock.getSubject).toHaveBeenCalled();
    expect(hourlyStrategyMock.getTemplate).toHaveBeenCalled();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "x@y.com",
        subject: "Hourly Subject",
        template: "hourly-template",
        context: expect.objectContaining({
          greeting: "Hi there",
          city: "CityX",
          unsubscribeUrl: "https://unsubscribe/CityX",
          weather,
        }),
      }),
    );
  });

  it("throws if no strategy found for given frequency", async () => {
    (strategyResolver.get as jest.Mock).mockImplementation((freq) => {
      throw new Error(`No strategy found for frequency ${freq}`);
    });
    await expect(sender.send(-1 as unknown as UpdateFrequency)).rejects.toThrow(
      "No strategy found for frequency -1",
    );
  });
});
