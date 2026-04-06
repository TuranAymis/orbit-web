import { describe, expect, it } from "vitest";
import { mapLoginErrorMessage } from "@/features/auth/auth-service";
import { HttpError } from "@/shared/lib/http/httpClient";

describe("auth-service login error mapping", () => {
  it("maps inactive-account backend errors to a verification message", () => {
    const error = new HttpError("Forbidden", 403, {
      detail: "User account is not active yet.",
    });

    expect(mapLoginErrorMessage(error)).toBe(
      "Your account is not active yet. Please verify your email before logging in.",
    );
  });

  it("falls back to the backend message for other auth failures", () => {
    const error = new HttpError("Invalid email or password.", 401, {
      detail: "Invalid email or password.",
    });

    expect(mapLoginErrorMessage(error)).toBe("Invalid email or password.");
  });
});
