import { mapAuthHttpError, mapUnknownAuthError } from "@/features/auth/auth-errors";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface ResendVerificationCodeInput {
  email: string;
}

export interface ResendVerificationCodeResult {
  email: string;
}

export async function resendVerificationCode(
  input: ResendVerificationCodeInput,
): Promise<ResendVerificationCodeResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    await httpClient.post("/auth/resend-verification-code", {
      email: normalizedEmail,
    });

    return {
      email: normalizedEmail,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw mapAuthHttpError("resend_verification", error);
    }

    throw mapUnknownAuthError();
  }
}
