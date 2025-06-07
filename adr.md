## ADR-001: Вибір фреймворку для Node.js

#### Статус: Прийнято
#### Дата: 2025-06-06
#### Автор: Heorhii Huziuk

### Контекст
Потрібно обрати фреймворк для побудови веб-застосунку:
* Обширність модулів
* Можливість масштабування і подальшого портування на мікросервісну архітектуру
* Швидкодія і надійність
* Використання Dependency Injection

### Розглянуті варіанти:

#### 1. ExpressJS:
* Плюси: швидкість налаштування, швидка інтеграція розробників, простота
* Мінуси: низька безпека, відсутня підтримка Dependency injection з коробки

#### 2. Fastify:
* Плюси: висока продуктивність, підтримка плагінів, вбудована схема валідації, менше споживання ресурсів у порівнянні з Expres
* Мінуси: менша екосистема порівняно з Express, менше прикладів у спільноті, складніша налагоджуваність для новачків

#### 3. Nest.js:
* Плюси: можна підключити ExpressJS чи Fastify, велика кількість модулів, DI з коробки, архітектура подібна до Angular (для тих, хто знайомий)
* Мінуси: важкість для нових розробників, хто не працював з ним, більший поріг входу, складніша структура проєкту

### Прийняте рішення:
Nest.js

### Схема проєкту:
```text
.
├── Dockerfile
├── LICENSE
├── README.md
├── adr.md
├── app.module.ts
├── docker-compose.yml
├── eslint.config.mjs
├── html
│   └── index.html
├── index.ts
├── jest.config.js
├── package-lock.json
├── package.json
├── src
│   ├── shared
│   │   ├── configs
│   │   │   └── config.ts
│   │   ├── database
│   │   │   ├── migrations
│   │   │   │   └── 1747650320970-InitSchema.ts
│   │   │   └── postgres-connection.ts
│   │   └── enums
│   │       └── frequency.enum.ts
│   ├── subscription
│   │   ├── application
│   │   │   ├── dto
│   │   │   │   └── get-weather.dto.ts
│   │   │   └── services
│   │   │       ├── subscription.service.spec.ts
│   │   │       ├── subscription.service.ts
│   │   │       └── types.ts
│   │   ├── domain
│   │   │   └── entities
│   │   │       └── subscription.entity.ts
│   │   ├── infrastructure
│   │   │   ├── database
│   │   │   │   └── subscription.orm-entity.ts
│   │   │   └── repositories
│   │   │       ├── subscription.repository.interface.ts
│   │   │       └── subscription.repository.ts
│   │   ├── presentation
│   │   │   └── controllers
│   │   │       └── subscription.controller.ts
│   │   └── subscription.module.ts
│   └── weather
│       ├── application
│       │   ├── dto
│       │   │   ├── confirm-subscription.dto.ts
│       │   │   ├── create-subscription.dto.ts
│       │   │   └── unsubscribe.dto.ts
│       │   └── services
│       │       ├── weather.service.spec.ts
│       │       └── weather.service.ts
│       ├── domain
│       │   └── entities
│       │       └── weather.entity.ts
│       ├── infrastructure
│       │   ├── database
│       │   │   └── weather.orm-entity.ts
│       │   └── repositories
│       │       ├── weather.repository.interface.ts
│       │       └── weather.repository.ts
│       ├── presentation
│       │   └── controllers
│       │       └── weather.controller.ts
│       └── weather.module.ts
├── templates
│   ├── confirm-subscription.hbs
│   ├── daily-subscription.hbs
│   └── hourly-subscription.hbs
└── tsconfig.json

31 directories, 41 files
```

---

### Наслідки

#### Позитивні: 
    * Отримуємо чітку модульну структуру, що спрощує масштабування та підтримку
    * Вбудована підтримка Dependency Injection покращує тестованість і архітектуру
    * Nest.js має активну спільноту, підтримує багато готових рішень(автентифікація, валідація, ORM, тощо)

#### Негативні: 
    * Вищий поріг входу для нових або junior-розробників
    * Зайва складність для невеликих застосунків або MVP
    * Потрібно більше часу на первинне навчання та налаштування процесів розробки
