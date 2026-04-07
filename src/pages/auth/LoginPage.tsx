import { useState } from "react";
import { ArrowRight, AtSign, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthError } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationSuccess = searchParams.get("verified") === "1";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/discover", { replace: true });
    } catch (submissionError) {
      if (submissionError instanceof AuthError) {
        setError(submissionError.message);
      } else {
        setError("We could not sign you in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(182,100,255,0.10),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(78,221,255,0.05),_transparent_18%)]" />
      <div className="absolute inset-0 bg-orbit-grid bg-[size:52px_52px] opacity-[0.06]" />

      <div className="relative grid w-full max-w-[1180px] gap-10 lg:grid-cols-[560px_260px]">
        <div className="flex flex-col items-center">
          <div className="mb-10 text-center">
            <p className="text-5xl font-bold uppercase tracking-[-0.05em] text-primary">Orbit</p>
            <div className="mx-auto mt-4 h-px w-20 bg-primary/40" />
          </div>

          <Card className="w-full border-primary/15 bg-[#14141a] shadow-[0_20px_80px_rgba(182,100,255,0.08)]">
            <CardContent className="space-y-8 p-10">
              <div className="space-y-3">
                <h2 className="sr-only">Welcome back to Orbit</h2>
                <h1 className="text-6xl font-bold tracking-tight text-foreground">
                  Access Terminal
                </h1>
                <p className="text-xl leading-8 text-muted-foreground">
                  Please enter your credentials to initiate sequence.
                </p>
              </div>

              {isLoading ? (
                <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-muted-foreground">
                  Restoring your Orbit session...
                </div>
              ) : null}

              {verificationSuccess ? (
                <p className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Your account is active now. Sign in to continue.
                </p>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="space-y-3 text-sm text-foreground">
                  <span className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                    Identity Tag
                  </span>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="Email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@orbit.sys"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-11"
                    />
                  </div>
                </label>

                <label className="space-y-3 text-sm text-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                      Access Key
                    </span>
                    <Link className="text-xs font-semibold uppercase tracking-[0.2em] text-primary" to="/verify-account">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="Password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-11"
                    />
                  </div>
                </label>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {error}
                  </p>
                ) : null}

                <Button
                  className="w-full justify-center text-lg"
                  type="submit"
                  aria-label={isSubmitting ? "Signing in" : "Continue to Orbit"}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? "Signing in..." : "Log In"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-5">
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <div className="h-px flex-1 bg-white/10" />
                  Third party auth
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="secondary" className="justify-center">Identity</Button>
                  <Button variant="secondary" className="justify-center">Biometrics</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-lg text-muted-foreground">
            New to the system?{" "}
            <Link className="font-semibold text-primary" to="/register">
              Create Account
            </Link>
          </div>
          <div className="mt-6 flex gap-6 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </div>

        <div className="hidden items-center lg:flex">
          <div className="w-full border-l border-white/8 pl-10">
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary">System Status</p>
                <p className="mt-3 flex items-center gap-3 text-5xl font-bold tracking-tight text-foreground">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  Operational
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary">Protocol</p>
                <p className="mt-3 text-xl leading-9 text-muted-foreground">
                  Multi-layer synthetic encryption active.
                </p>
              </div>
              <div className="flex gap-8 pt-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className="h-12 w-1.5 rounded-full bg-primary/60" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
