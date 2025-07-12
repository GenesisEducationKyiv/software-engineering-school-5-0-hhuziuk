module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/modules/**/tests/integration/**/*.integration.spec.ts"],
  setupFiles: ["dotenv/config"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  transform: { "^.+\\.(t|j)s$": "ts-jest" }
};