import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";

export class InitSchema1747650320970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "weather",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "temperature",
            type: "numeric",
            isNullable: false,
          },
          {
            name: "humidity",
            type: "numeric",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "fetchedAt",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamptz",
            default: "now()",
          },
        ],
        indices: [
          new TableIndex({
            name: "IDX_weather_city",
            columnNames: ["city"],
            isUnique: true,
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "subscription",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "frequency",
            type: "enum",
            enum: Object.values(UpdateFrequency),
            isNullable: false,
          },
          {
            name: "confirmed",
            type: "boolean",
            default: false,
          },
          {
            name: "token",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "createdAt",
            type: "timestamptz",
            default: "now()",
          },
        ],
        indices: [
          new TableIndex({
            name: "IDX_subscription_email_city",
            columnNames: ["email", "city"],
            isUnique: true,
          }),
          new TableIndex({
            name: "IDX_subscription_token",
            columnNames: ["token"],
            isUnique: true,
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("subscription", true);
    await queryRunner.dropTable("weather", true);
  }
}
