"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminLogin } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await adminLogin(email, password);
    if (!response.success || !response.data) {
      setError("Invalid credentials or not authorized");
      setLoading(false);
      return;
    }

    setAuthSession(response.data.token, response.data.name);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.35),transparent_55%),linear-gradient(180deg,#fef9f2,#ffffff)] px-6 py-10">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
              Gym Admin
            </div>
            <h1 className="font-['Space_Grotesk'] text-4xl font-semibold text-black">
              Keep every membership on track.
            </h1>
            <p className="text-sm text-black/60">
              Review renewals, payments, and member status from a single dashboard built for fast front-desk operations.
            </p>
            <div className="grid gap-3 text-sm text-black/70 sm:grid-cols-2">
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                Monitor expiring memberships in seconds.
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                Log renewals with automatic receipts.
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                Track payments and overdue balances.
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
                Keep member statuses accurate daily.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-soft">
            <div className="mb-8">
              <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-black">
                Admin Sign In
              </h2>
              <p className="text-sm text-black/60">Use your admin credentials to continue.</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="admin@gym.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-xs text-black/50">
                By continuing, you agree to manage member data responsibly.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
