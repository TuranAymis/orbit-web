import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUser } from "@/features/auth/register/model/useRegisterUser";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getInputErrorClass(hasError: boolean) {
  return hasError
    ? "border-rose-500/40 focus-visible:border-rose-400 focus-visible:ring-rose-500/20"
    : "";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterUser();
  const { message, clearMessage } = useMutationFeedback(registerMutation.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  function validateForm() {
    const nextErrors: RegisterFormErrors = {};

    if (!isValidEmail(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
          <h1 className="text-3xl font-semibold tracking-tight">Create your Orbit account</h1>
          <p className="text-sm text-muted-foreground">
            Register with your email, then activate the account with the code Orbit sends to your inbox.
          </p>
        </div>
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
              const result = await registerMutation.mutateAsync({
                email,
                password,
              });

              navigate(`/verify-account?email=${encodeURIComponent(result.email)}`, {
                replace: true,
                state: {
                  email: result.email,
                  notice: "We sent a verification code to your email.",
                },
              });
            } catch {
              return;
            }
          }}
        >
          <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="register-email"
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
            <label htmlFor="register-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              aria-invalid={Boolean(errors.password)}
              className={getInputErrorClass(Boolean(errors.password))}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({
                  ...current,
                  password: undefined,
                  confirmPassword:
                    current.confirmPassword && confirmPassword === event.target.value
                      ? undefined
                      : current.confirmPassword,
                }));
              }}
            />
            {errors.password ? (
              <p className="text-sm text-rose-200">{errors.password}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Use a secure password with at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-confirm-password"
              className="text-sm font-medium text-foreground"
            >
              Confirm password
            </label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              aria-invalid={Boolean(errors.confirmPassword)}
              className={getInputErrorClass(Boolean(errors.confirmPassword))}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrors((current) => ({ ...current, confirmPassword: undefined }));
              }}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-rose-200">{errors.confirmPassword}</p>
            ) : null}
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p>
            Already have an Orbit account?{" "}
            <Link className="text-primary transition hover:text-primary/80" to="/login">
              Sign in
            </Link>
          </p>
          <p>
            Already received your code?{" "}
            <Link
              className="text-primary transition hover:text-primary/80"
              to={email ? `/verify-account?email=${encodeURIComponent(email)}` : "/verify-account"}
            >
              Verify your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
