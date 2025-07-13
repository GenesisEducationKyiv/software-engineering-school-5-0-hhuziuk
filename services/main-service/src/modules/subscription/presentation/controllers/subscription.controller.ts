import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { SubscriptionService } from "../../application/services/subscription.service";
import { CreateSubscriptionDto } from "../../../weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "../../../weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "../../../weather/application/dto/unsubscribe.dto";

@Controller()
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Post("subscribe")
  async subscribe(@Body() dto: CreateSubscriptionDto): Promise<{ message: string }> {
    await this.service.subscribe(dto);
    return { message: "Subscription successful. Confirmation email sent." };
  }

  @Get("confirm/:token")
  async confirm(@Param() params: ConfirmSubscriptionDto): Promise<{ message: string }> {
    await this.service.confirm(params);
    return { message: "Subscription confirmed successfully" };
  }

  @Get("unsubscribe/:token")
  async unsubscribe(@Param() params: UnsubscribeDto): Promise<{ message: string }> {
    await this.service.unsubscribe(params);
    return { message: "Unsubscribed successfully" };
  }
}
