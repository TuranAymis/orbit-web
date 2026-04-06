import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface VerifyUserEmailInput {
  email: string;
  code: string;
}

export interface VerifyUserEmailResult {
  email: string;
}

function getVerifyErrorMessage(error: HttpError) {
  if (error.status === 400 || error.status === 404 || error.status === 422) {
    return "We couldn't verify that code. Check the email and verification code, then try again.";
  }

  return error.message || "We could not verify your account right now.";
}

export async function verifyUserEmail(
  input: VerifyUserEmailInput,
): Promise<VerifyUserEmailResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedCode = input.code.trim();

  try {
    await httpClient.post("/auth/verify", {
      email: normalizedEmail,
      code: normalizedCode,
    });

    return {
      email: normalizedEmail,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error(getVerifyErrorMessage(error));
    }

    throw new Error("Orbit could not reach the local backend.");
  }
}
