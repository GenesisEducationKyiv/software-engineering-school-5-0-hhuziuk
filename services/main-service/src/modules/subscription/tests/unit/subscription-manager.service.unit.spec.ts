import {
  SubscriptionManager,
  SubscriptionFactory,
} from "../../application/services/subscription-manager.service";
import { ConflictException } from "@nestjs/common";
import { CreateSubscriptionDto } from "../../../weather/application/dto/create-subscription.dto";
import { SubscriptionQueryRepository } from "../../infrastructure/repositories/subscription-query.repository";
import { SubscriptionCommandRepository } from "../../infrastructure/repositories/subscription-command.repository";
import { Subscription } from "../../domain/entities/subscription.entity";

describe("SubscriptionManager", () => {
  let manager: SubscriptionManager;
  let queryRepo: jest.Mocked<SubscriptionQueryRepository>;
  let commandRepo: jest.Mocked<SubscriptionCommandRepository>;
  let factory: jest.Mocked<SubscriptionFactory>;

  beforeEach(() => {
    queryRepo = {
      isEmailSubscribed: jest.fn(),
    } as any;

    commandRepo = {
      create: jest.fn(),
      confirmSubscription: jest.fn(),
      unsubscribe: jest.fn(),
    } as any;

    factory = {
      create: jest.fn(),
    } as any;

    manager = new SubscriptionManager(queryRepo, commandRepo, factory);
  });

  describe("subscribe", () => {
    const dto: CreateSubscriptionDto = {
      email: "user@example.com",
      city: "Kyiv",
      frequency: "DAILY" as any,
    };
    const token = "token-123";
    const fakeSubscription = new Subscription(
      "id-uuid",
      dto.email,
      dto.city,
      dto.frequency,
      false,
      token,
      new Date(),
    );

    it("should throw ConflictException if already subscribed", async () => {
      queryRepo.isEmailSubscribed.mockResolvedValue(true);
      await expect(manager.subscribe(dto, token)).rejects.toThrow(ConflictException);
      expect(queryRepo.isEmailSubscribed).toHaveBeenCalledWith(dto.email, dto.city);
      expect(factory.create).not.toHaveBeenCalled();
      expect(commandRepo.create).not.toHaveBeenCalled();
    });

    it("should create subscription when not yet subscribed", async () => {
      queryRepo.isEmailSubscribed.mockResolvedValue(false);
      factory.create.mockReturnValue(fakeSubscription);

      const result = await manager.subscribe(dto, token);

      expect(queryRepo.isEmailSubscribed).toHaveBeenCalledWith(dto.email, dto.city);
      expect(factory.create).toHaveBeenCalledWith(dto, token);
      expect(commandRepo.create).toHaveBeenCalledWith(fakeSubscription);
      expect(result).toBe(fakeSubscription);
    });
  });

  describe("confirm", () => {
    it("should call commandRepo.confirmSubscription", async () => {
      const token = "token-456";
      await manager.confirm(token);
      expect(commandRepo.confirmSubscription).toHaveBeenCalledWith(token);
    });
  });

  describe("unsubscribe", () => {
    it("should call commandRepo.unsubscribe", async () => {
      const token = "token-789";
      await manager.unsubscribe(token);
      expect(commandRepo.unsubscribe).toHaveBeenCalledWith(token);
    });
  });
});

describe("SubscriptionFactory", () => {
  let factory: SubscriptionFactory;

  beforeEach(() => {
    factory = new SubscriptionFactory();
  });

  it("create() returns Subscription with correct fields", () => {
    const dto: CreateSubscriptionDto = {
      email: "u@e.com",
      city: "Lviv",
      frequency: "HOURLY" as any,
    };
    const token = "tok-101";
    const subscription = factory.create(dto, token);

    expect(subscription).toBeInstanceOf(Subscription);
    expect(subscription.email).toBe(dto.email);
    expect(subscription.city).toBe(dto.city);
    expect(subscription.frequency).toBe(dto.frequency);
    expect(subscription.token).toBe(token);
    expect(subscription.confirmed).toBe(false);
    expect(subscription.id).toHaveLength(36);
    expect(subscription.createdAt).toBeInstanceOf(Date);
  });
});
