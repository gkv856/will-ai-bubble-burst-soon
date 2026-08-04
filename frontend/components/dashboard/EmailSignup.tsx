"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }

      setStatus("success");
      setMessage(`You're on the list — we'll email you at ${email} the moment risk enters Bubble Territory.`);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      className="glass-card rounded-2xl p-6 sm:p-8 text-center"
      style={{ borderColor: "rgba(239, 68, 68, 0.18)" }}
    >
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-red-500/15 border border-red-500/25 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>

      <h3 className="text-xl font-semibold text-white/90 mb-1.5">
        Get an early warning before the crash
      </h3>
      <p className="text-sm text-white/40 max-w-md mx-auto mb-6 leading-relaxed">
        We&apos;ll send you one email the moment risk enters Bubble
        Territory — early enough to sell, hedge, or short before everyone
        else reacts.
      </p>

      {status === "success" ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-mono animate-fade-up"
        >
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
          noValidate
        >
          <label htmlFor="alert-email" className="sr-only">
            Email address
          </label>
          <input
            id="alert-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === "loading"}
            aria-invalid={status === "error"}
            className="flex-1 h-10 px-3.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus-visible:border-red-500/50 focus-visible:ring-1 focus-visible:ring-red-500/30 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-10 px-4 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Notify me"
            )}
          </button>
        </form>
      )}

      {status === "error" && (
        <p role="alert" className="text-red-400 text-xs font-mono mt-3">
          {message}
        </p>
      )}

      <p className="text-[11px] text-white/25 font-mono mt-4">
        Not financial advice. One alert email, unsubscribe anytime.
      </p>
    </div>
  );
}
