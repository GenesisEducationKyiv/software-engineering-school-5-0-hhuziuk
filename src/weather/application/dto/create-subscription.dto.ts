import { UpdateFrequency } from "src/shared/enums/frequency.enum";
import { IsEmail, IsEnum, IsString, Length } from "class-validator";

export class CreateSubscriptionDto {
  @IsEmail()
  @Length(5, 255, { message: "Email must be between 5 and 255 characters" })
  email!: string;

  @IsString()
  @Length(1, 100, { message: "City name must be between 1 and 100 characters" })
  city!: string;

  @IsEnum(UpdateFrequency)
  frequency!: UpdateFrequency;
}
