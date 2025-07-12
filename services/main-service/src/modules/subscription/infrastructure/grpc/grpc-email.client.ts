import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";

interface GrpcEmailService {
    send(data: any): Observable<{ success: boolean }>;
}

@Injectable()
export class GrpcEmailClientService implements OnModuleInit {
    private service!: GrpcEmailService;

    constructor(@Inject("EMAIL_PACKAGE") private readonly client: ClientGrpc) {}

    onModuleInit() {
        this.service = this.client.getService<GrpcEmailService>("EmailService");
    }

    async send(data: any): Promise<void> {
        await lastValueFrom(this.service.send(data));
    }
}