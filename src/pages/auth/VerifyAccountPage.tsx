import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useResendVerificationCode } from "@/features/auth/resend-verification-code/model/useResendVerificationCode";
import { useVerifyUserEmail } from "@/features/auth/verify/model/useVerifyUserEmail";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface VerifyAccountLocationState {
  email?: string;
  notice?: string;
}

interface VerifyFormErrors {
  email?: string;
  code?: string;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getInputErrorClass(hasError: boolean) {
  return hasError
    ? "border-rose-500/40 focus-visible:border-rose-400 focus-visible:ring-rose-500/20"
    : "";
}

export function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const verifyMutation = useVerifyUserEmail();
  const resendMutation = useResendVerificationCode();
  const { message, clearMessage } = useMutationFeedback(verifyMutation.error);
  const locationState = (location.state ?? null) as VerifyAccountLocationState | null;
  const [email, setEmail] = useState(
    () => searchParams.get("email") ?? locationState?.email ?? "",
  );
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<VerifyFormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(
    locationState?.notice ?? null,
  );
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const hasPrefilledEmail = email.trim().length > 0;

  useEffect(() => {
    if (cooldownRemaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldownRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldownRemaining]);

  function validateForm() {
    const nextErrors: VerifyFormErrors = {};

    if (!isValidEmail(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (code.trim().length === 0) {
      nextErrors.code = "Enter the verification code from your email.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.24),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(76,29,149,0.22),_transparent_35%)]" />
      <div className="absolute inset-0 bg-orbit-grid bg-[size:48px_48px] opacity-[0.16]" />
      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-black/40 p-8 shadow-shell backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-primary">
            Orbit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Verify your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter the email address you registered with and the activation code from your inbox.
          </p>
        </div>
        {statusMessage ? (
          <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {statusMessage}
          </p>
        ) : null}
        <form
          className="space-y-4"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            clearMessage();
            setResendError(null);

            if (!validateForm()) {
              return;
            }

            try {
              const result = await verifyMutation.mutateAsync({
                email,
                code,
              });
              navigate(`/login?email=${encodeURIComponent(result.email)}&verified=1`, {
                replace: true,
              });
            } catch {
              return;
            }
          }}
        >
          <div className="space-y-2">
            <label htmlFor="verify-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="verify-email"
              type="email"
              autoComplete="email"
              placeholder="you@orbit.dev"
              value={email}
              aria-invalid={Boolean(errors.email)}
              className={getInputErrorClass(Boolean(errors.email))}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
            />
            {errors.email ? <p className="text-sm text-rose-200">{errors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="verify-code" className="text-sm font-medium text-foreground">
              Verification code
            </label>
            <Input
              id="verify-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              aria-invalid={Boolean(errors.code)}
              className={getInputErrorClass(Boolean(errors.code))}
              onChange={(event) => {
                setCode(event.target.value);
                setErrors((current) => ({ ...current, code: undefined }));
              }}
            />
            {errors.code ? (
              <p className="text-sm text-rose-200">{errors.code}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Check your inbox for the code Orbit sent after registration.
              </p>
            )}
          </div>
          {!hasPrefilledEmail ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
              Enter the email address you registered with, then paste the verification code from your inbox.
            </p>
          ) : null}
          {message ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {message}
            </p>
          ) : null}
          {resendError ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {resendError}
            </p>
          ) : null}
          <Button
            className="w-full justify-center"
            type="submit"
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? "Verifying account..." : "Verify account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Didn&apos;t get the code?</p>
              <p className="text-xs text-muted-foreground">
                {cooldownRemaining > 0
                  ? `You can request another code in ${cooldownRemaining} seconds.`
                  : "Send a fresh verification email to the same address."}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              aria-live="polite"
              disabled={resendMutation.isPending || cooldownRemaining > 0}
              onClick={async () => {
                setResendError(null);
                setStatusMessage(null);
                clearMessage();

                if (!isValidEmail(email.trim())) {
                  setErrors((current) => ({
                    ...current,
                    email: "Please enter a valid email address.",
                  }));
                  return;
                }

                try {
                  await resendMutation.mutateAsync({ email });
                  setStatusMessage("A new verification code has been sent.");
                  setCooldownRemaining(30);
                } catch (error) {
                  setResendError(
                    error instanceof Error
                      ? error.message
                      : "We couldn't resend the verification code right now.",
                  );
                }
              }}
            >
              {resendMutation.isPending
                ? "Sending..."
                : cooldownRemaining > 0
                  ? `Resend in ${cooldownRemaining}s`
                  : "Resend code"}
            </Button>
          </div>
          <p>
            Already activated?{" "}
            <Link
              className="text-primary transition hover:text-primary/80"
              to={email ? `/login?email=${encodeURIComponent(email)}` : "/login"}
            >
              Sign in
            </Link>
          </p>
          <p>
            Need to start over?{" "}
            <Link className="text-primary transition hover:text-primary/80" to="/register">
              Create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
