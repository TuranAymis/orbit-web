import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserResult {
  email: string;
}

function getRegisterErrorMessage(error: HttpError) {
  if (error.status === 409) {
    return "An account with this email already exists. Try signing in or verify your email instead.";
  }

  if (error.status === 400 || error.status === 422) {
    return "We couldn't create your account. Please check your email and password, then try again.";
  }

  return error.message || "We couldn't create your account right now.";
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
      throw new Error(getRegisterErrorMessage(error));
    }

    throw new Error("Orbit could not reach the local backend.");
  }
}
