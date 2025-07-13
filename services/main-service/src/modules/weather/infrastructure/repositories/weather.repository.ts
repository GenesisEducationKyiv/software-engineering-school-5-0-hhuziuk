import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WeatherOrmEntity } from "../database/weather.orm-entity";
import { Repository } from "typeorm";
import { IWeatherRepository } from "./weather.repository.interface";
import { Weather } from "../../domain/entities/weather.entity";

@Injectable()
export class WeatherRepository implements IWeatherRepository {
  constructor(
    @InjectRepository(WeatherOrmEntity)
    private readonly ormRepo: Repository<WeatherOrmEntity>,
  ) {}

  private toDomain(entity: WeatherOrmEntity): Weather {
    return new Weather(
      entity.city,
      Number(entity.temperature),
      Number(entity.humidity),
      entity.description,
      entity.fetchedAt,
    );
  }

  private toOrm(weather: Weather): Partial<WeatherOrmEntity> {
    return {
      city: weather.city,
      temperature: weather.temperature,
      humidity: weather.humidity,
      description: weather.description,
      fetchedAt: weather.fetchedAt,
    };
  }

  async findByCity(city: string): Promise<Weather | null> {
    const entity = await this.ormRepo.findOne({ where: { city } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(weather: Weather): Promise<void> {
    const ormObj = this.toOrm(weather);
    await this.ormRepo.upsert(ormObj, ["city"]);
  }
}
