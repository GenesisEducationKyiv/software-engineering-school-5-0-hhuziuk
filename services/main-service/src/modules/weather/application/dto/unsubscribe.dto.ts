import { IsString, Length } from "class-validator";

export class UnsubscribeDto {
  @IsString()
  @Length(36, 36, { message: "Token must be a 36-character UUID" })
  token!: string;
}
