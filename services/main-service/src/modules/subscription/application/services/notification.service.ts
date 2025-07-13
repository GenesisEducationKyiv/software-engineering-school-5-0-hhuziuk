import { Injectable } from "@nestjs/common";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { NotificationBatchSender } from "./notification-batch-sender";

@Injectable()
export class NotificationService {
  constructor(private readonly batchSender: NotificationBatchSender) {}

  async sendBatch(frequency: UpdateFrequency): Promise<void> {
    await this.batchSender.send(frequency);
  }
}
