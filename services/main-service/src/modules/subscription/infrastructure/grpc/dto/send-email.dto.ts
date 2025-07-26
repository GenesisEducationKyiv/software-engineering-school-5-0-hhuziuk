import { IsEmail, IsEnum, IsObject, IsString } from "class-validator";
import { EmailContext } from "./templates.interface";

export enum TemplateType {
  CONFIRM = "confirm-subscription",
  DAILY = "daily-subscription",
  HOURLY = "hourly-subscription",
}

export class SendEmailDto {
  @IsEmail()
  email!: string;

  @IsEnum(TemplateType)
  template!: TemplateType;

  @IsString()
  subject!: string;

  @IsObject()
  context!: EmailContext;
}
