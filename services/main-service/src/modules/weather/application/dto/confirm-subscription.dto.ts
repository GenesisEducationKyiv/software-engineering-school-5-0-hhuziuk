import { IsString, Length } from "class-validator";

export class ConfirmSubscriptionDto {
  @IsString()
  @Length(36, 36, { message: "Token must be a 36-character UUID" })
  token!: string;
}
