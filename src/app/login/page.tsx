"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Wrong password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 grain ambient-glow relative">
      <div className="w-full max-w-[320px]">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)" }}>
            <Lock size={24} style={{ color: "var(--amber)" }} />
          </div>
          <h1 className="font-serif text-[28px] font-semibold tracking-tight">Life OS</h1>
          <p className="text-[13px] text-[var(--text-3)] mt-1 font-mono">Private. Secure. Yours.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            className="w-full h-12 px-4 rounded-xl text-[15px] outline-none transition-all"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />

          {error && (
            <p className="text-[12px] font-mono text-center" style={{ color: "var(--rose)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full h-12 rounded-xl text-[14px] font-medium transition-all"
            style={{
              backgroundColor: password ? "var(--amber)" : "var(--surface-2)",
              color: password ? "#0b0908" : "var(--text-4)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
