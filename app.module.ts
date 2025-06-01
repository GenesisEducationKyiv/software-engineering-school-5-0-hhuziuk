import { Module } from "@nestjs/common";
import { WeatherModule } from "@/weather/weather.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriptionModule } from "@/subscription/subscription.module";
import { config } from "@/shared/configs/config";
import { SubscriptionOrmEntity } from "@/subscription/infrastructure/database/subscription.orm-entity";
import { WeatherOrmEntity } from "@/weather/infrastructure/database/weather.orm-entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { ScheduleModule } from "@nestjs/schedule";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
      defaults: {
        from: `"Weather App" <${config.mailer.from}>`,
      },
      template: {
        dir: config.mailer.templates.dir,
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: config.db.host,
      port: config.db.port,
      username: config.db.user,
      password: config.db.password,
      database: config.db.database,
      entities: [WeatherOrmEntity, SubscriptionOrmEntity],
      synchronize: config.db.synchronize,
    }),
    WeatherModule,
    SubscriptionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
