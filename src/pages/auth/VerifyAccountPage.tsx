import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  const { message, clearMessage } = useMutationFeedback(verifyMutation.error);
  const locationState = (location.state ?? null) as VerifyAccountLocationState | null;
  const [email, setEmail] = useState(
    () => searchParams.get("email") ?? locationState?.email ?? "",
  );
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<VerifyFormErrors>({});

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
        {locationState?.notice ? (
          <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {locationState.notice}
          </p>
        ) : null}
        <form
          className="space-y-4"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            clearMessage();

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
          {message ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {message}
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
