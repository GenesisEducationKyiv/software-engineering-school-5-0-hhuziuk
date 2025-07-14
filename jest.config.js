module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.unit.spec.ts", "**/architecture.spec.ts"],
  setupFiles: ["<rootDir>/test/setup-env.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  transform: { "^.+\\.(t|j)s$": "ts-jest" },
};
