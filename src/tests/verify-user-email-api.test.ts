import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyUserEmail } from "@/features/auth/verify/api/verifyUserEmail";

describe("verifyUserEmail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the normalized email and code to the backend route POST /auth/verify-email", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Email verified" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await verifyUserEmail({ email: "  User@Orbit.Local ", code: " 123456 " });

    expect(result).toEqual({ email: "user@orbit.local" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/auth/verify-email",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@orbit.local", code: "123456" }),
      }),
    );
  });
});
