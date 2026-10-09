import { mapAuthHttpError, mapUnknownAuthError } from "@/features/auth/auth-errors";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface VerifyUserEmailInput {
  email: string;
  code: string;
}

export interface VerifyUserEmailResult {
  email: string;
}

export async function verifyUserEmail(
  input: VerifyUserEmailInput,
): Promise<VerifyUserEmailResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedCode = input.code.trim();

  try {
    await httpClient.post("/auth/verify-email", {
      email: normalizedEmail,
      code: normalizedCode,
    });

    return {
      email: normalizedEmail,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw mapAuthHttpError("verify", error);
    }

    throw mapUnknownAuthError();
  }
}
