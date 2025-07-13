import { Injectable } from "@nestjs/common";
import { NotificationStrategy } from "./interfaces/notification-strategy.interface";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";

@Injectable()
export class NotificationStrategyResolver {
  private readonly strategies: Map<UpdateFrequency, NotificationStrategy>;

  constructor(strategies: NotificationStrategy[]) {
    this.strategies = new Map(strategies.map((s) => [s.frequency, s]));
  }

  get(frequency: UpdateFrequency): NotificationStrategy {
    const strategy = this.strategies.get(frequency);
    if (!strategy) {
      throw new Error(`No strategy found for frequency ${frequency}`);
    }
    return strategy;
  }
}
