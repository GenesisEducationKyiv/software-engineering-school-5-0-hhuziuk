import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { EmailClientService } from "@/shared/clients/email-client.service";

@Module({
  imports: [HttpModule],
  providers: [EmailClientService],
  exports: [EmailClientService],
})
export class EmailModule {}
