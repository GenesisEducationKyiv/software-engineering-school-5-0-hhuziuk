import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";
import { SendEmailDto } from "@/modules/subscription/infrastructure/grpc/dto/send-email.dto";

interface GrpcEmailService {
  Send(request: SendEmailDto): Observable<SendEmailResponse>;
}

interface SendEmailResponse {
  success: boolean;
}

@Injectable()
export class GrpcEmailClientService implements OnModuleInit {
  private service!: GrpcEmailService;

  constructor(@Inject("EMAIL_PACKAGE") private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.service = this.client.getService<GrpcEmailService>("EmailService");
  }

  async send(data: SendEmailDto): Promise<void> {
    const response = await lastValueFrom(this.service.Send(data));
    if (!response.success) {
      throw new Error("gRPC email send failed");
    }
  }
}
