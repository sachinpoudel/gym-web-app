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
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">Admin Login</h1>
          <p className="text-sm text-black/60">Sign in to manage the gym.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-black/60">
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
            <label className="mb-2 block text-xs font-semibold uppercase text-black/60">
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
            <div className="rounded-md border border-black/20 bg-neutral-100 px-3 py-2 text-sm text-black">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
