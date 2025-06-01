import dotenv from "dotenv";
import { join } from "node:path";
dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  port: 3000,

  app: {
    baseUrl: requireEnv("APP_BASE_URL"),
  },

  apiKey: requireEnv("API_KEY"),

  db: {
    host: requireEnv("DB_HOST"),
    port: parseInt(requireEnv("DB_PORT"), 10),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_DATABASE"),
    synchronize: true,
  },

  mailer: {
    host: requireEnv("SMTP_HOST"),
    port: parseInt(requireEnv("SMTP_PORT"), 10),
    secure: requireEnv("SMTP_SECURE") === "true",
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
    from: requireEnv("SMTP_FROM"),
    templates: {
      dir: join(process.cwd(), "templates"),
    },
  },
};
