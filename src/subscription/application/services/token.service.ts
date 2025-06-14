import { v4 as uuidv4 } from "uuid";
import { config } from "@/shared/configs/config";

export class TokenService {
  generate(): string {
    return uuidv4();
  }

  getConfirmUrl(token: string): string {
    return `${config.app.baseUrl}/api/confirm/${token}`;
  }

  getUnsubscribeUrl(token: string): string {
    return `${config.app.baseUrl}/api/unsubscribe/${token}`;
  }
}
