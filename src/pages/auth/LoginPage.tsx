import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.24),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(76,29,149,0.22),_transparent_35%)]" />
      <div className="absolute inset-0 bg-orbit-grid bg-[size:48px_48px] opacity-[0.16]" />
      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-black/40 p-8 shadow-shell backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-primary">
            Orbit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back to Orbit
          </h1>
          <p className="text-sm text-muted-foreground">
            Access your groups, conversations, and event workflows from one control
            center.
          </p>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-muted-foreground">
            Restoring your Orbit session...
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="demo@orbit.dev"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="orbit123"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {error}
            </p>
          ) : null}
          <Button
            className="w-full justify-center"
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Signing in..." : "Continue to Orbit"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
