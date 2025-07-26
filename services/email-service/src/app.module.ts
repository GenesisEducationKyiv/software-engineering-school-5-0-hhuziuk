import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { config } from "./shared/configs/config";
import { EmailModule } from "./modules/email/email.module";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: config.mailer.host,
        port: config.mailer.port,
        secure: config.mailer.secure,
        auth: {
          user: config.mailer.user,
          pass: config.mailer.pass,
        },
      },
      defaults: { from: `"No Reply" <${config.mailer.from}>` },
      template: {
        dir: config.mailer.templatesDir,
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    EmailModule,
  ],
})
export class AppModule {}
