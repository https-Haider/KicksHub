"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function VerifyOtpPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // helper to tick down cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // initialize resend cooldown from order state on mount (if an OTP was recently sent)
  useEffect(() => {
    const initFromServer = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const last = data?.otpLastSentAt ?? null;
        if (!last) return;
        const COOLDOWN_MS = 30 * 1000; // match server default; server returns cooldown on send
        const remainingMs = last + COOLDOWN_MS - Date.now();
        const remainingSec = Math.ceil(remainingMs / 1000);
        if (remainingSec > 0) setResendCooldown(remainingSec);
      } catch (e) {
        // ignore errors silently; resend still works by user action
      }
    };

    initFromServer();
  }, [orderId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otp }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error || "Verification failed");
        setLoading(false);
        return;
      }
      setSuccess(true);
      // redirect to thank-you page after confirmation email is sent
      router.push(`/order-success/${orderId}`);
    } catch (err) {
      setError("Network error, try again.");
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendMessage(null);
    setIsResending(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.status === 429) {
        const retry = payload?.retryAfterSeconds ?? 30;
        setResendCooldown(retry);
        setResendMessage(`Please wait ${retry}s before retrying.`);
        setIsResending(false);
        return;
      }
      if (!res.ok) {
        setResendMessage(payload?.error || "Failed to resend OTP");
        setIsResending(false);
        return;
      }

      const cooldown = payload?.cooldownSeconds ?? 30;
      setResendCooldown(cooldown);
      setResendMessage(`Code resent to ${payload?.sentTo ?? "your email"}`);
    } catch (err) {
      setResendMessage("Network error while resending OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email for order{" "}
          <span className="font-mono">{orderId}</span>.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full p-3 rounded border"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resendOtp}
              disabled={isResending || resendCooldown > 0}
              className="flex-1"
            >
              {isResending
                ? "Resending..."
                : resendCooldown > 0
                ? `Resend (${resendCooldown}s)`
                : "Resend code"}
            </Button>
            <Link href={`/orders/${orderId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Order
              </Button>
            </Link>
          </div>

          {resendMessage && (
            <p className="text-sm text-muted-foreground mt-2">
              {resendMessage}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
