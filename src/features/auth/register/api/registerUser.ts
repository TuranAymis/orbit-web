import { mapAuthHttpError, mapUnknownAuthError } from "@/features/auth/auth-errors";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserResult {
  email: string;
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    await httpClient.post("/auth/register", {
      email: normalizedEmail,
      password: input.password,
    });

    return {
      email: normalizedEmail,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw mapAuthHttpError("register", error);
    }

    throw mapUnknownAuthError();
  }
}
