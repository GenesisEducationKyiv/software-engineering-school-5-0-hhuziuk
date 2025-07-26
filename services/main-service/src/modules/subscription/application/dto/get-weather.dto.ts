import { IsString, Length } from "class-validator";

export class GetWeatherDto {
  @IsString()
  @Length(1, 100, { message: "City name must be between 1 and 100 characters" })
  city!: string;
}
