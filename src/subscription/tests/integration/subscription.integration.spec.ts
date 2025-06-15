import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getDataSourceToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as dotenv from "dotenv";

import { SubscriptionModule } from "src/subscription/subscription.module";
import { SubscriptionController } from "src/subscription/presentation/controllers/subscription.controller";
import { SubscriptionOrmEntity } from "src/subscription/infrastructure/database/subscription.orm-entity";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "src/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "src/weather/application/dto/unsubscribe.dto";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";

import { SubscriptionService } from "@/subscription/application/services/subscription.service";
import { NotificationService } from "@/subscription/application/services/notification.service";

dotenv.config({ path: ".env.test" });

describe("SubscriptionController Integration", () => {
  let moduleRef: TestingModule;
  let controller: SubscriptionController;
  let repo: Repository<SubscriptionOrmEntity>;
  let ds: DataSource;

  let mockSubscriptionService: {
    subscribe: jest.Mock;
    confirm: jest.Mock;
    unsubscribe: jest.Mock;
  };
  let mockNotificationService: {
    sendBatch: jest.Mock;
  };

  beforeAll(async () => {
    mockSubscriptionService = {
      subscribe: jest.fn().mockResolvedValue(undefined),
      confirm: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
    };
    mockNotificationService = {
      sendBatch: jest.fn().mockResolvedValue(undefined),
    };

    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: true,
          entities: [SubscriptionOrmEntity],
          logging: false,
        }),
        SubscriptionModule,
      ],
    })
      .overrideProvider(SubscriptionService)
      .useValue(mockSubscriptionService)
      .overrideProvider(NotificationService)
      .useValue(mockNotificationService)
      .compile();

    ds = moduleRef.get<DataSource>(getDataSourceToken());
    repo = ds.getRepository(SubscriptionOrmEntity);
    controller = moduleRef.get<SubscriptionController>(SubscriptionController);
  });

  afterAll(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  });

  beforeEach(async () => {
    if (repo) {
      try {
        await repo.clear();
      } catch (error) {
        console.error("Error clearing subscriptionRepo in beforeEach:", error);
        throw error;
      }
    }
    mockSubscriptionService.subscribe.mockClear();
    mockSubscriptionService.confirm.mockClear();
    mockSubscriptionService.unsubscribe.mockClear();
    mockNotificationService.sendBatch.mockClear();
  });

  it("POST /subscribe creates subscription and sends email", async () => {
    const dto: CreateSubscriptionDto = {
      email: "test@ex.com",
      city: "Kyiv",
      frequency: UpdateFrequency.DAILY,
    };
    const res = await controller.subscribe(dto);
    expect(res).toEqual({ message: "Subscription successful. Confirmation email sent." });
    expect(mockSubscriptionService.subscribe).toHaveBeenCalledWith(dto);
  });

  it("GET /confirm/:token confirms a subscription", async () => {
    const token = "abc-123-valid-token";
    const dto: ConfirmSubscriptionDto = { token };
    const result = await controller.confirm(dto);
    expect(result).toEqual({ message: "Subscription confirmed successfully" });
    expect(mockSubscriptionService.confirm).toHaveBeenCalledWith(dto);
  });

  it("GET /unsubscribe/:token unsubscribes the user", async () => {
    const token = "def-456-valid-token";
    const dto: UnsubscribeDto = { token };
    const result = await controller.unsubscribe(dto);
    expect(result).toEqual({ message: "Unsubscribed successfully" });
    expect(mockSubscriptionService.unsubscribe).toHaveBeenCalledWith(dto);
  });
});
