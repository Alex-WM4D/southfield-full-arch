import { test, expect } from "@playwright/test";

const TRACKING_HOSTS =
  /googletagmanager\.com|google-analytics\.com|ksrndkehqnwntyxlhgto\.com|iconnode\.com/;
// The Pages Function is not served by `vite preview`; tests answer for it so
// no email is ever sent.
const LEAD_ENDPOINT = "**/api/appointment-request";

for (const width of [320, 390, 1440]) {
  test(`landing page and appointment popup at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    const transmissions: string[] = [];
    const leads: Record<string, unknown>[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => {
      if (
        request.method() === "POST" &&
        !request.url().endsWith("/api/appointment-request")
      )
        transmissions.push(request.postData() ?? "");
    });
    await page.route(LEAD_ENDPOINT, route => {
      leads.push(route.request().postDataJSON());
      return route.fulfill({
        json: { ok: true, requestId: "synthetic-request" },
      });
    });
    await page.route(
      /manus\.computer|manus-storage|manus-analytics|\/__manus__\//,
      route => route.abort()
    );
    // Never send test traffic or synthetic leads to GA4 or WhatConverts.
    await page.route(TRACKING_HOSTS, route => route.abort());
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Two full-arch options:");
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("img").first()).toBeVisible();
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
    expect(sectionIds[1]).toBe("materials");
    expect(sectionIds[2]).toBe("consult");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBeTruthy();
    if (width < 640) {
      await expect(
        page
          .getByRole("region", {
            name: "Call Southfield Family Dental",
            exact: true,
          })
          .getByRole("link")
      ).toHaveAttribute("href", "tel:+12482152058");
    }
    const trigger = page
      .locator("main > section")
      .first()
      .getByRole("button", { name: "SCHEDULE FREE CONSULTATION", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "Request an Appointment",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    // WhatConverts form tracking is configured against this ID and name.
    await expect(
      dialog.locator(
        'form#appointment-request-form[name="appointment-request-form"]'
      )
    ).toHaveCount(1);
    for (const label of ["Full Name", "Phone", "Email", "Message"]) {
      await expect(dialog.getByLabel(label, { exact: true })).toHaveCount(1);
    }
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
    await expect(dialog.getByRole("status")).toContainText(
      "Your appointment request was received"
    );
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      fullName: "Synthetic Test",
      phone: "+12485550199",
      email: "synthetic@example.com",
      appointmentSmsConsent: false,
      marketingSmsConsent: false,
      consentVersion: "2026-10-09-v1",
      sourcePath: "/",
      website: "",
    });
    await expect(
      dialog.getByRole("link", { name: "Privacy Policy", exact: true })
    ).toHaveAttribute("target", "_blank");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    // Form values may only go to the practice's own lead endpoint.
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

test("a failed delivery keeps entries and points to the phone", async ({
  page,
}) => {
  await page.route(TRACKING_HOSTS, route => route.abort());
  await page.route(LEAD_ENDPOINT, route =>
    route.fulfill({ status: 500, json: { ok: false } })
  );
  await page.goto("/");
  await page
    .locator("main > section")
    .first()
    .getByRole("button", { name: "SCHEDULE FREE CONSULTATION", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Request an Appointment" });
  await dialog.getByLabel("Full Name", { exact: true }).fill("Synthetic Test");
  await dialog.getByLabel("Phone", { exact: true }).fill("2485550199");
  await dialog
    .getByLabel("Email", { exact: true })
    .fill("synthetic@example.com");
  await dialog
    .getByRole("button", { name: "Request an Appointment", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "We could not confirm delivery of your request. Please call (248) 215-2058"
  );
  await expect(dialog.getByLabel("Full Name", { exact: true })).toHaveValue(
    "Synthetic Test"
  );
});

test("GA4 and WhatConverts tags ship on every entry page", async ({ page }) => {
  await page.route(TRACKING_HOSTS, route => route.abort());
  for (const path of ["/", "/privacy-policy/", "/terms-of-service/"]) {
    await page.goto(path);
    await expect(
      page.locator(
        'head script[src="https://www.googletagmanager.com/gtag/js?id=G-50EEPYREL4"]'
      )
    ).toHaveCount(1);
    await expect(
      page.locator('head script[src="//s.ksrndkehqnwntyxlhgto.com/177101.js"]')
    ).toHaveCount(1);
  }
});

test("policy routes load directly and retain the home link", async ({
  page,
}) => {
  await page.route(TRACKING_HOSTS, route => route.abort());
  for (const [path, title] of [
    ["/terms-of-service/", "Terms of Service"],
    ["/privacy-policy/", "Privacy Policy"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await page
      .getByRole("link", { name: "Back to the full-arch page", exact: true })
      .click();
    await expect(page.locator("h1")).toContainText("Two full-arch options:");
  }
});

test("patient gallery retains manual selection", async ({ page }) => {
  await page.route(TRACKING_HOSTS, route => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const secondCase = page.getByRole("button", {
    name: "Show Southfield case 2",
    exact: true,
  });
  await secondCase.click();
  await expect(secondCase).toHaveAttribute("aria-pressed", "true");
});
