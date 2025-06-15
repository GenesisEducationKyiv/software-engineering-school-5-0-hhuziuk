import { test, expect, Page } from "@playwright/test";

const PAGE_URL = "http://localhost:8080/html/index.html";

test.describe("Weather Subscription Page", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    await page.goto(PAGE_URL);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("should display the subscription form correctly", async () => {
    await expect(page.locator("h1")).toHaveText("Weather Subscription");
    await expect(page.locator('label[for="email"]')).toHaveText("Email address");
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator('label[for="city"]')).toHaveText("City");
    await expect(page.locator("input#city")).toBeVisible();
    await expect(page.locator('label[for="frequency"]')).toHaveText("Update frequency");
    await expect(page.locator("select#frequency")).toBeVisible();
    await expect(page.locator("button#submit-btn")).toHaveText("Subscribe");
    await expect(page.locator("button#submit-btn")).toBeEnabled();
    await expect(page.locator("div#message")).toBeHidden();
  });

  test("should successfully subscribe with valid data", async () => {
    await page.route("**/api/subscribe", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");
      const body = request.postDataJSON();
      expect(body.email).toBe("test@example.com");
      expect(body.city).toBe("London");
      expect(body.frequency).toBe("daily");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Subscription successful. Confirmation email sent." }),
      });
    });

    await page.locator("input#email").fill("test@example.com");
    await page.locator("input#city").fill("London");
    await page.locator("select#frequency").selectOption("daily");
    await page.locator("button#submit-btn").click();

    const messageDiv = page.locator("div#message");
    await expect(messageDiv).toBeVisible();
    await expect(messageDiv).toHaveText("Subscription successful. Confirmation email sent.");
    await expect(messageDiv).toHaveClass(/success/);
    await expect(page.locator("button#submit-btn")).toBeEnabled();
  });

  test("should show an error message if subscription fails (e.g., API error)", async () => {
    await page.route("**/api/subscribe", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await page.locator("input#email").fill("fail@example.com");
    await page.locator("input#city").fill("ErrorCity");
    await page.locator("select#frequency").selectOption("hourly");
    await page.locator("button#submit-btn").click();

    const messageDiv = page.locator("div#message");
    await expect(messageDiv).toBeVisible();
    await expect(messageDiv).toContainText("500 Internal Server Error");
    await expect(messageDiv).toHaveClass(/error/);
    await expect(page.locator("button#submit-btn")).toBeEnabled();
  });

  test("should show an error message if API returns a non-OK status with custom error message", async () => {
    await page.route("**/api/subscribe", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ message: "Email already subscribed for this city" }),
      });
    });

    await page.locator("input#email").fill("duplicate@example.com");
    await page.locator("input#city").fill("SomeCity");
    await page.locator("select#frequency").selectOption("daily");
    await page.locator("button#submit-btn").click();

    const messageDiv = page.locator("div#message");
    await expect(messageDiv).toBeVisible();
    await expect(messageDiv).toContainText("Email already subscribed for this city");
    await expect(messageDiv).toHaveClass(/error/);
  });

  test("should disable submit button during submission", async () => {
    await page.route("**/api/subscribe", async (route) => {
      await expect(page.locator("button#submit-btn")).toBeDisabled();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Delayed success" }),
      });
    });

    await page.locator("input#email").fill("test@example.com");
    await page.locator("input#city").fill("London");
    await page.locator("select#frequency").selectOption("daily");

    await page.locator("button#submit-btn").click();

    await expect(page.locator("button#submit-btn")).toBeEnabled();
    const messageDiv = page.locator("div#message");
    await expect(messageDiv).toHaveText("Delayed success");
  });

  test("should require email, city, and frequency", async () => {
    await page.locator("input#city").fill("Test City");
    await page.locator("select#frequency").selectOption("daily");
    await page.locator("button#submit-btn").click();
    const emailInput = page.locator("input#email");
    const isEmailInvalid = await emailInput.evaluate(
      (input) => !(input as HTMLInputElement).checkValidity(),
    );
    expect(isEmailInvalid).toBe(true);
    await expect(page.locator("div#message")).toBeHidden();

    await page.reload();
    await page.locator("input#email").fill("test@example.com");
    await page.locator("select#frequency").selectOption("daily");
    await page.locator("button#submit-btn").click();
    const cityInput = page.locator("input#city");
    const isCityInvalid = await cityInput.evaluate(
      (input) => !(input as HTMLInputElement).checkValidity(),
    );
    expect(isCityInvalid).toBe(true);
    await expect(page.locator("div#message")).toBeHidden();

    await page.reload();
    await page.locator("input#email").fill("test@example.com");
    await page.locator("input#city").fill("Test City");
    await page.locator("button#submit-btn").click();
    const frequencySelect = page.locator("select#frequency");
    const isFrequencyInvalid = await frequencySelect.evaluate(
      (select) => !(select as HTMLSelectElement).checkValidity(),
    );
    expect(isFrequencyInvalid).toBe(true);
    await expect(page.locator("div#message")).toBeHidden();
  });
});
