import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { Transport, ClientProxyFactory, ClientProxy } from "@nestjs/microservices";
import * as amqp from "amqplib";
import { EmailModule } from "@/modules/email/email.module";
import { SendEmailDto, TemplateType } from "@/modules/email/dto/send-email.dto";
import { EmailService } from "@/modules/email/email.service";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";
import { MailerService } from "@nestjs-modules/mailer";
import { firstValueFrom } from "rxjs";

jest.setTimeout(20000);

describe("RmqEmailListener (integration)", () => {
  let app: INestApplication;
  let client: ClientProxy;
  let channel: amqp.Channel;

  const queue = `send_email_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  beforeAll(async () => {
    const mailerMock = { sendMail: jest.fn().mockResolvedValue(undefined) };
    const loggerMock = { debug: jest.fn(), log: jest.fn(), error: jest.fn() };

    const moduleFixture = await Test.createTestingModule({
      imports: [EmailModule],
    })
      .overrideProvider(MailerService)
      .useValue(mailerMock)
      .overrideProvider(WinstonLogger)
      .useValue(loggerMock)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useLogger(false);

    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://guest:guest@localhost:5673"],
        queue,
        queueOptions: { durable: false },
      },
    });

    await app.startAllMicroservices();
    await app.init();

    client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://guest:guest@localhost:5673"],
        queue,
        queueOptions: { durable: false },
      },
    });
    await client.connect();
  });

  afterAll(async () => {
    if (client) await client.close();
    if (app) await app.close();
  });

  it("should get an event ans send email", async () => {
    const dto: SendEmailDto = {
      email: "test@example.com",
      template: TemplateType.CONFIRM,
      subject: "Test RMQ Email",
      context: { unsubscribeUrl: "http://test/" },
    };

    const emailService = app.get(EmailService);
    const sendSpy = jest.spyOn(emailService, "send").mockResolvedValue(undefined);

    await firstValueFrom(client.emit("send_email", dto));

    await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (sendSpy.mock.calls.length > 0) {
          clearInterval(interval);
          resolve(undefined);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        reject("send not called within timeout");
      }, 3000);
    });

    expect(sendSpy).toHaveBeenCalledWith(dto);
  });
});
