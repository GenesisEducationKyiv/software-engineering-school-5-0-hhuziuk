import "tsarch/dist/jest";
import { filesOfProject } from "tsarch";

describe("Архітектурні залежності проекту", () => {
  jest.setTimeout(60000);

  it("Domain шар не залежить від інших шарів", async () => {
    const domainPaths = ["src/weather/domain", "src/subscription/domain"];

    for (const path of domainPaths) {
      const base = filesOfProject().inFolder(path);
      await expect(base.shouldNot().dependOnFiles().inFolder("src/application")).toPassAsync();
      await expect(base.shouldNot().dependOnFiles().inFolder("src/infrastructure")).toPassAsync();

      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/weather/presentation/controllers"),
      ).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/subscription/presentation/controllers"),
      ).toPassAsync();

      await expect(base.shouldNot().dependOnFiles().inFolder("src/shared")).toPassAsync();
    }
  });

  it("Application шар не залежить від Presentation контролерів", async () => {
    const appPaths = ["src/weather/application", "src/subscription/application"];

    for (const path of appPaths) {
      const base = filesOfProject().inFolder(path);
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/weather/presentation/controllers"),
      ).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/subscription/presentation/controllers"),
      ).toPassAsync();
    }
  });

  it("Infrastructure шар не залежить від Presentation контролерів", async () => {
    const infraPaths = ["src/weather/infrastructure", "src/subscription/infrastructure"];

    for (const path of infraPaths) {
      const base = filesOfProject().inFolder(path);
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/weather/presentation/controllers"),
      ).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/subscription/presentation/controllers"),
      ).toPassAsync();
    }
  });

  it("Presentation контролери не залежать від Domain та Infrastructure", async () => {
    const folders = [
      "src/weather/presentation/controllers",
      "src/subscription/presentation/controllers",
    ];

    for (const path of folders) {
      const base = filesOfProject().inFolder(path);
      await expect(base.shouldNot().dependOnFiles().inFolder("src/weather/domain")).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/subscription/domain"),
      ).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/weather/infrastructure"),
      ).toPassAsync();
      await expect(
        base.shouldNot().dependOnFiles().inFolder("src/subscription/infrastructure"),
      ).toPassAsync();
    }
  });

  it("Shared шар не залежить від інших", async () => {
    const base = filesOfProject().inFolder("src/shared");
    const targets = [
      "src/weather/domain",
      "src/subscription/domain",
      "src/weather/application",
      "src/subscription/application",
      "src/weather/infrastructure",
      "src/subscription/infrastructure",
      "src/weather/presentation/controllers",
      "src/subscription/presentation/controllers",
    ];

    for (const target of targets) {
      await expect(base.shouldNot().dependOnFiles().inFolder(target)).toPassAsync();
    }
  });

  it("Weather модуль не залежить від Subscription", async () => {
    const base = filesOfProject().inFolder("src/weather");
    await expect(base.shouldNot().dependOnFiles().inFolder("src/subscription")).toPassAsync();
  });
});
