import { Test, TestingModule } from "@nestjs/testing";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule, getDataSourceToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as dotenv from "dotenv";
import { WeatherModule } from "src/weather/weather.module";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { GetWeatherDto } from "src/subscription/application/dto/get-weather.dto";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";
import { RedisService } from "@/shared/redis/redis.service";

dotenv.config({ path: ".env.test" });

jest.setTimeout(15_000);

describe("WeatherController Integration", () => {
  let controller: WeatherController;
  let ds: DataSource;
  let weatherRepo: Repository<WeatherOrmEntity>;

  const redisStub = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    quit: jest.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: true,
          entities: [WeatherOrmEntity],
          logging: false,
        }),
        WeatherModule,
      ],
    })
      .overrideProvider(RedisService)
      .useValue(redisStub)
      .compile();

    ds = moduleRef.get<DataSource>(getDataSourceToken());
    weatherRepo = ds.getRepository(WeatherOrmEntity);
    controller = moduleRef.get<WeatherController>(WeatherController);
  });

  beforeEach(async () => {
    await weatherRepo.clear();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (ds?.isInitialized) {
      await ds.destroy();
    }
    await redisStub.quit();
  });

  it("GET /weather returns current weather from DB", async () => {
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

    expect(redisStub.set).toHaveBeenCalledWith(
      expect.stringContaining("weather:kyiv"),
      expect.objectContaining({
        city: "Kyiv",
        temperature: 22.5,
        humidity: 55,
        description: "Partly cloudy",
      }),
      expect.any(Number),
    );
  });
});
