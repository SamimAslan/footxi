"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/auth/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <span className="text-3xl font-bold tracking-tight">
              <span className="text-[var(--foreground)]">FOOT</span>
              <span className="text-white">XI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            Join FootXI and start shopping premium kits
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/35 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/35 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/35 transition-colors"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[color:var(--border)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-brand-green/35 transition-colors"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-green text-white font-semibold text-sm hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[color:var(--border)]" />
          <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-[color:var(--border)]" />
        </div>

        {/* Google Sign Up */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--surface)] border border-[color:var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:border-brand-green/30 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-white hover:text-white/90 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
