import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { IsEmail, IsEnum, IsString, Length, IsNotEmpty } from "class-validator";

export class CreateSubscriptionDto {
  @IsEmail({}, { message: "Invalid email format" })
  @Length(5, 255, { message: "Email must be between 5 and 255 characters" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "City name cannot be empty" })
  @Length(1, 100, { message: "City name must be between 1 and 100 characters" })
  city!: string;

  @IsEnum(UpdateFrequency, { message: "Invalid frequency value" })
  frequency!: UpdateFrequency;
}
