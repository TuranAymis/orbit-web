import { HttpError } from "@/shared/lib/http/httpClient";

export type AuthErrorReason = "generic" | "inactive_account";
export type AuthErrorKind =
  | "login"
  | "register"
  | "verify"
  | "resend_verification";

interface BackendAuthErrorPayload {
  detail?: string | unknown[];
  message?: string;
  error?: string;
}

export class AuthError extends Error {}

export class OrbitAuthError extends AuthError {
  reason: AuthErrorReason;

  constructor(message: string, reason: AuthErrorReason = "generic") {
    super(message);
    this.name = "AuthError";
    this.reason = reason;
  }
}

function getBackendAuthErrorText(error: HttpError) {
  const payload = (error.payload ?? {}) as BackendAuthErrorPayload;
  const parts = [error.message];

  if (typeof payload.detail === "string") {
    parts.push(payload.detail);
  }

  if (typeof payload.message === "string") {
    parts.push(payload.message);
  }

  if (typeof payload.error === "string") {
    parts.push(payload.error);
  }

  return parts.join(" ").trim().toLowerCase();
}

function getInactiveAccountReason(error: HttpError): AuthErrorReason {
  const normalizedMessage = getBackendAuthErrorText(error);

  if (
    (error.status === 400 || error.status === 401 || error.status === 403) &&
    (normalizedMessage.includes("inactive") ||
      normalizedMessage.includes("not active") ||
      normalizedMessage.includes("verify") ||
      normalizedMessage.includes("activation"))
  ) {
    return "inactive_account";
  }

  return "generic";
}

function getAuthErrorMessage(kind: AuthErrorKind, error: HttpError) {
  switch (kind) {
    case "login":
      if (getInactiveAccountReason(error) === "inactive_account") {
        return "Your account is not active yet. Please verify your email before logging in.";
      }

      return error.message;
    case "register":
      if (error.status === 409) {
        return "An account with this email already exists. Try signing in or verify your email instead.";
      }

      if (error.status === 400 || error.status === 422) {
        return "We couldn't create your account. Please check your email and password, then try again.";
      }

      return error.message || "We couldn't create your account right now.";
    case "verify":
      if (error.status === 400 || error.status === 404 || error.status === 422) {
        return "We couldn't verify that code. Check the email and verification code, then try again.";
      }

      return error.message || "We could not verify your account right now.";
    case "resend_verification":
      if (error.status === 404 || error.status === 405) {
        return "Resend verification is not available yet. Please use the latest code from your email.";
      }

      if (error.status === 400 || error.status === 422) {
        return "We couldn't resend the code. Check your email address and try again.";
      }

      return error.message || "We couldn't resend the verification code right now.";
  }
}

export function mapAuthHttpError(kind: AuthErrorKind, error: HttpError) {
  return new OrbitAuthError(
    getAuthErrorMessage(kind, error),
    kind === "login" ? getInactiveAccountReason(error) : "generic",
  );
}

export function mapUnknownAuthError() {
  return new OrbitAuthError("Orbit could not reach the local backend.");
}

export function mapLoginErrorMessage(error: HttpError) {
  return getAuthErrorMessage("login", error);
}

export function getLoginErrorReason(error: HttpError) {
  return getInactiveAccountReason(error);
}
