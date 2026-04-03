import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as getSettingsApi from "@/features/settings/get-settings/api/getSettings";
import * as updateSettingsApi from "@/features/settings/update-settings/api/updateSettings";
import { SettingsPage } from "@/pages/settings/SettingsPage";

function renderSettingsPage() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders mapped backend settings values", async () => {
    vi.spyOn(getSettingsApi, "getSettings").mockResolvedValue({
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      profileVisibility: "members",
      themePreference: "dark",
      language: "en",
    });

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/theme preference/i)).toHaveValue("dark");
  });

  it("renders loading and error states", async () => {
    vi.spyOn(getSettingsApi, "getSettings").mockRejectedValue(new Error("Network error"));

    renderSettingsPage();

    expect(screen.getByTestId("settings-loading")).toBeInTheDocument();
    expect(
      await screen.findByText(/we couldn't load your settings right now/i),
    ).toBeInTheDocument();
  });

  it("wires the settings save action", async () => {
    vi.spyOn(getSettingsApi, "getSettings").mockResolvedValue({
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      profileVisibility: "members",
      themePreference: "dark",
      language: "en",
    });
    const updateSpy = vi
      .spyOn(updateSettingsApi, "updateSettings")
      .mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderSettingsPage();

    await screen.findByLabelText(/push notifications/i);
    await user.click(screen.getByLabelText(/push notifications/i));
    await user.selectOptions(screen.getByLabelText(/language/i), "tr");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        profileVisibility: "members",
        themePreference: "dark",
        language: "tr",
      }, expect.anything());
    });
  });
});
