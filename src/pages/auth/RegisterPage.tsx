import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUser } from "@/features/auth/register/model/useRegisterUser";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(182,100,255,0.10),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(78,221,255,0.05),_transparent_18%)]" />
      <div className="absolute inset-0 bg-orbit-grid bg-[size:52px_52px] opacity-[0.06]" />

      <div className="relative w-full max-w-[620px]">
        <div className="mb-10 text-center">
          <p className="text-5xl font-bold uppercase tracking-[-0.05em] text-primary">Orbit</p>
          <div className="mx-auto mt-4 h-px w-20 bg-primary/40" />
        </div>

        <Card className="border-primary/15 bg-[#14141a] shadow-[0_20px_80px_rgba(182,100,255,0.08)]">
          <CardContent className="space-y-8 p-10">
            <div className="space-y-3">
              <h2 className="sr-only">Create your Orbit account</h2>
              <h1 className="text-6xl font-bold tracking-tight text-foreground">
                Create Account
              </h1>
              <p className="text-xl leading-8 text-muted-foreground">
                Register with your email, then activate the account with the verification code Orbit sends.
              </p>
            </div>

            <form
              className="space-y-5"
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
              <label className="space-y-3 text-sm text-foreground">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Identity Tag
                </span>
                <Input
                  aria-label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@orbit.dev"
                  value={email}
                  aria-invalid={Boolean(errors.email)}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
                {errors.email ? <p className="text-sm text-rose-200">{errors.email}</p> : null}
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-3 text-sm text-foreground">
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Access Key
                  </span>
                  <Input
                    aria-label="Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    aria-invalid={Boolean(errors.password)}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((current) => ({ ...current, password: undefined }));
                    }}
                  />
                  {errors.password ? (
                    <p className="text-sm text-rose-200">{errors.password}</p>
                  ) : null}
                </label>

                <label className="space-y-3 text-sm text-foreground">
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Confirm Key
                  </span>
                  <Input
                    aria-label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setErrors((current) => ({ ...current, confirmPassword: undefined }));
                    }}
                  />
                  {errors.confirmPassword ? (
                    <p className="text-sm text-rose-200">{errors.confirmPassword}</p>
                  ) : null}
                </label>
              </div>

              {message ? (
                <p
                  role="alert"
                  className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                >
                  {message}
                </p>
              ) : null}

              <Button
                className="w-full justify-center text-lg"
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="space-y-2 text-center text-lg text-muted-foreground">
              <p>
                Already have an Orbit account?{" "}
                <Link className="font-semibold text-primary" to="/login">
                  Sign in
                </Link>
              </p>
              <p>
                Already received your code?{" "}
                <Link
                  className="font-semibold text-primary"
                  to={email ? `/verify-account?email=${encodeURIComponent(email)}` : "/verify-account"}
                >
                  Verify account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
