import { DataSource } from "typeorm";
import { config } from "src/shared/configs/config";

export const PostgresDataSource: DataSource = new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  synchronize: false,
  logging: false,
  entities: [],
  subscribers: [],
  migrations: [__dirname + "./migrations/*{.ts,.js}"],
});
