import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`landing page and appointment popup at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    const transmissions: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (request.method() === "POST")
        transmissions.push(request.postData() ?? "");
    });
    await page.route(
      /manus\.computer|manus-storage|manus-analytics|\/__manus__\//,
      route => route.abort()
    );
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Restore Your Confidence");
    await expect(page.locator("h1")).toContainText("With Dental Implants");
    await expect(page.locator("form")).toHaveCount(0);
    const hero = page.locator("main > section").first();
    await expect(hero).toContainText("$15,000");
    await expect(
      hero.locator("[data-weekly-promotion-countdown]")
    ).toBeVisible();
    const thumbnail = page.locator("[data-troy-supplied-thumbnail]");
    await expect(thumbnail).toHaveAttribute(
      "src",
      /^\/images\/troys-story-thumbnail-/
    );
    for (const image of await page.locator("img").all()) {
      if (!(await image.isVisible())) continue;
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate(e => (e as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    }
    const sectionIds = await page
      .locator("main > section")
      .evaluateAll(elements => elements.map(e => e.id));
    expect(sectionIds.slice(1, 5)).toEqual([
      "team",
      "reviews",
      "materials",
      "consult",
    ]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBeTruthy();
    await expect(page.locator("[data-count-up-display]")).toHaveText([
      "26+",
      "1,000+",
    ]);
    if (width < 640) {
      await expect(
        page
          .getByRole("region", {
            name: "Call Southfield Family Dental",
            exact: true,
          })
          .getByRole("link")
      ).toHaveAttribute("href", "tel:+12485696304");
    }
    const trigger = hero.getByRole("button", {
      name: "SCHEDULE FREE CONSULTATION",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "Request an Appointment",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    for (const label of ["Full Name", "Phone", "Email", "Message"])
      await expect(dialog.getByLabel(label, { exact: true })).toHaveCount(1);
    for (const consent of await dialog.getByRole("checkbox").all()) {
      await expect(consent).not.toBeChecked();
      await expect(consent).not.toHaveAttribute("required");
    }
    await dialog
      .getByLabel("Full Name", { exact: true })
      .fill("Synthetic Test");
    await dialog.getByLabel("Phone", { exact: true }).fill("2485550199");
    await dialog
      .getByLabel("Email", { exact: true })
      .fill("synthetic@example.com");
    await dialog
      .getByRole("button", { name: "Request an Appointment", exact: true })
      .click();
    await expect(dialog.getByRole("alert")).toContainText(
      "No request has been sent"
    );
    await expect(
      dialog.getByRole("link", { name: "Privacy Policy", exact: true })
    ).toHaveAttribute("target", "_blank");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(
      transmissions.every(
        body =>
          !body.includes("synthetic@example.com") &&
          !body.includes("Synthetic Test")
      )
    ).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test("policy routes load directly and retain the home link", async ({
  page,
}) => {
  for (const [path, title] of [
    ["/terms-of-service/", "Terms of Service"],
    ["/privacy-policy/", "Privacy Policy"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await page
      .getByRole("link", { name: "Back to the full-arch page", exact: true })
      .click();
    await expect(page.locator("h1")).toContainText("Restore Your Confidence");
  }
});

test("patient gallery retains manual selection", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const secondCase = page.getByRole("button", {
    name: "Show Southfield case 2",
    exact: true,
  });
  await secondCase.click();
  await expect(secondCase).toHaveAttribute("aria-pressed", "true");
});

test("Troy thumbnail opens the correct video", async ({ page }) => {
  // Test the UI and destination without sending a request to the video provider.
  await page.route("https://drive.google.com/**", route =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Test video frame</title>",
    })
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Watch Troy’s patient story", exact: true })
    .click();
  const frame = page.locator('iframe[title="Troy’s patient story"]');
  await expect(frame).toBeVisible();
  await expect(frame).toHaveAttribute(
    "src",
    "https://drive.google.com/file/d/1pofu2ZbnzJT8IC2l9ShAee0YawaIujBM/preview"
  );
});

test("doctor numbers count up once on scroll", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const stats = page.locator("[data-doctor-authority-stats]");
  const numbers = stats.locator("[data-count-up-display]");
  await expect(numbers).toHaveText(["0+", "0+"]);
  await stats.scrollIntoViewIfNeeded();
  await expect(numbers).toHaveText(["26+", "1,000+"]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await stats.scrollIntoViewIfNeeded();
  await expect(numbers).toHaveText(["26+", "1,000+"]);
});
