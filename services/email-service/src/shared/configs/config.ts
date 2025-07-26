import dotenv from "dotenv";
import { join } from "node:path";

dotenv.config();

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: parseInt(requireEnv("EMAIL_SERVICE_PORT"), 10),

  mailer: {
    host: requireEnv("SMTP_HOST"),
    port: parseInt(requireEnv("SMTP_PORT"), 10),
    secure: requireEnv("SMTP_SECURE") === "true",
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
    from: requireEnv("SMTP_FROM"),
    templatesDir: __dirname + "/../../templates",
  },
};
