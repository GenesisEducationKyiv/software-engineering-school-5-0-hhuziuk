* Виділити в поточному додатку модулі, які варто винести в окремий мікросервіс.

Я б виділив один загальний модуль, який відповідає за запис до бд, логування і роботу з кешем,
наприклад `main-service` і модуль, який відповідає за надсилання email: `mail-service`, як це було обговорено на лекції,
оскільки застосунок маленький і розпиляти subscription і weather, як на мене, не сильно має сенс

Якщо візуалізувати, то модулі виглядатимуть приблизно так:
* для `main-service`
```text
main-service/
├── Dockerfile
├── docker-compose.yml 
├── README.md
├── src/
│   ├── app.module.ts 
│   ├── main.ts 
│   ├── shared/
│   │   ├── configs/
│   │   ├── database/
│   │   │   └── postgres-connection.ts
│   │   ├── redis/
│   │   │   └── redis.service.ts
│   │   └── logger/
│   │       ├── logger.ts
│   │       └── winston-logger.service.ts
│   ├── modules/
│   │   ├── subscription/
│   │   │   ├── subscription.module.ts
│   │   │   ├── application/
│   │   │   ├── domain/entities/
│   │   │   └── infrastructure/repositories/
│   │   └── weather/
│   │       ├── weather.module.ts
│   │       ├── application/
│   │       ├── domain/entities/
│   │       └── infrastructure/repositories/
│   └── controllers/
│       ├── subscription.controller.ts
│       └── weather.controller.ts
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
```
> P.S. Хоча, якщо часу буде достатньо, то можна розділити `weather` і `subscription` на окремі сервіси, оскільки їхні модулі не звʼязані між собою в бд

і для `mail-service`:
```text
email-service/
├── Dockerfile
├── docker-compose.yml
├── README.md
├── src/
│   ├── app.module.ts 
│   ├── main.ts 
│   ├── shared/
│   │   └── configs/
│   ├── modules/
│   │   └── email/
│   │       ├── email.module.ts
│   │       ├── email.service.ts 
│   │       └── dto/
│   │           ├── send-email.dto.ts
│   │           └── templates.interface.ts
│   └── templates/
│       ├── confirm-subscription.hbs
│       ├── daily-subscription.hbs
│       └── hourly-subscription.hbs
└── package.json
```

* Підібрати оптимальний варіант мікросервісної комунікації для всіх виділених сервісів.

Я б обрав брокер повідомлень **NATS**:

* Тип: event-driven / async messaging
* пітримка `pub/sub` і `request-reply` режимів роботи
* легкість конфігурації і інтегрованість в nest.js
* низький latency і висока продуктивність

Як аналог, можна використати REST, але між gRPC/Kafka/RabbitMQ я б обрав NATS