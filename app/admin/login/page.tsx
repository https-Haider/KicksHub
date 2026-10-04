"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-context";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (await login(password)) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid password");
      setPassword("");
    }

    setIsLoading(false);
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-olive px-4 py-12">
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-rust/25 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-sand/15 blur-3xl" />
      <Card className="relative w-full max-w-md rounded-[2rem] border-white/10 bg-[#fbf9f4] p-7 shadow-2xl shadow-black/25 sm:p-9">
        <div className="mb-8">
          <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-rust text-white shadow-lg shadow-rust/20"><LockKeyhole className="size-5" /></div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[.25em] text-rust">KicksHub store desk</p>
          <h1 className="text-3xl font-black tracking-tight text-ink">Welcome back.</h1>
          <p className="mt-2 text-sm leading-6 text-ink/55">Sign in to manage inventory, fulfill orders, and keep the storefront moving.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-ink">
              Admin password
            </label>
            <div className="relative"><input id="admin-password" autoComplete="current-password" autoFocus required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 pr-12 text-ink outline-none transition placeholder:text-ink/30 focus:border-rust focus:ring-4 focus:ring-rust/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink/40 hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Open store desk"}
          </Button>
        </form>

        <div className="mt-6 border-t border-black/8 pt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-rust"><ArrowLeft className="size-4" /> Back to storefront</Link>
        </div>
      </Card>
    </main>
  );
}
