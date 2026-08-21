import { test, expect } from "@playwright/test";

test.describe("Land AI End-to-End Verification User Journey", () => {
  test("Officer navigates from Dashboard, inspects deed, corrects area field, and verifies record", async ({ page }) => {
    // 1. Mock user authentication state in localStorage / cookies
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "auth_token",
        JSON.stringify({
          token: "mock_jwt_token_verification_officer",
          role: "VERIFICATION_OFFICER",
          user: { name: "Vikram Deshmukh", email: "v.deshmukh@revenue.gov.in" }
        })
      );
    });

    // 2. Navigate to the Executive Dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/Land AI/i);
    await expect(page.locator("h1")).toContainText("Land AI Enterprise Dashboard");

    // 3. Verify KPI cards are rendered
    await expect(page.getByText("Total Documents")).toBeVisible();
    await expect(page.getByText("Extracted Records")).toBeVisible();
    await expect(page.getByText("Pending Officer Verification")).toBeVisible();

    // 4. Click a record pending verification
    const reviewButton = page.locator("a[href^='/verification/']").first();
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    // 5. Lands on the side-by-side Verification Workspace
    await expect(page).toHaveURL(/\/verification\/\d+/);
    await expect(page.getByText("गाव नमुना सात (७)")).toBeVisible();

    // 6. Enter Edit Mode
    const editBtn = page.getByRole("button", { name: /EDIT/i });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // 7. Correct an extracted field (e.g. Total Area input)
    const areaInput = page.locator("input[type='number']").first();
    await expect(areaInput).toBeVisible();
    await areaInput.fill("2.54");

    // 8. Click "Save & Verify" to persist corrections
    const saveBtn = page.getByRole("button", { name: /Save & Verify/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 9. Assert success notification banner
    await expect(
      page.getByText(/Corrections saved and record verified|Corrections applied successfully/i)
    ).toBeVisible();
  });
});
