beforeAll(() => {
  process.env.SMTP_HOST = "mock.smtp.host";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_SECURE = "true";
  process.env.SMTP_USER = "mock-user@example.com";
  process.env.SMTP_PASS = "mock-pass";
  process.env.SMTP_FROM = "mock-sender@example.com";
  process.env.APP_BASE_URL = "http://localhost:3000";
  process.env.API_KEY = "mock-mock-api-key";
});

import { Test, TestingModule } from "@nestjs/testing";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule, getDataSourceToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as dotenv from "dotenv";
import { WeatherModule } from "src/weather/weather.module";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { GetWeatherDto } from "src/subscription/application/dto/get-weather.dto";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";

dotenv.config({ path: ".env.test" });

describe("WeatherController Integration", () => {
  let moduleRef: TestingModule;
  let controller: WeatherController;
  let ds: DataSource;
  let weatherRepo: Repository<WeatherOrmEntity>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT!,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: true,
          entities: [WeatherOrmEntity],
          logging: false,
        }),
        WeatherModule,
      ],
    }).compile();

    ds = moduleRef.get<DataSource>(getDataSourceToken());
    weatherRepo = ds.getRepository(WeatherOrmEntity);
    controller = moduleRef.get<WeatherController>(WeatherController);
  });

  afterAll(async () => {
    if (ds && ds.isInitialized) {
      await ds.destroy();
    }
  });

  beforeEach(async () => {
    if (weatherRepo) {
      try {
        await weatherRepo.clear();
      } catch (error) {
        console.error("Error clearing weatherRepo in beforeEach:", error);
        throw error;
      }
    }
  });

  it("GET /weather returns current weather from DB", async () => {
    if (!weatherRepo) {
      throw new Error("Weather repository not initialized for test.");
    }

    await weatherRepo.save(
        weatherRepo.create({
          city: "Kyiv",
          temperature: 22.5,
          humidity: 55,
          description: "Partly cloudy",
          fetchedAt: new Date(),
        }),
    );

    const dto: GetWeatherDto = { city: "Kyiv" };
    const result = await controller.getWeather(dto);

    expect(result).toEqual({
      temperature: 22.5,
      humidity: 55,
      description: "Partly cloudy",
    });
  });
});
