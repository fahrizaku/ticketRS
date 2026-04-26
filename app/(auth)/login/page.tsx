"use client";
import React, { useState, useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff, Loader2, Stethoscope, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-1 w-full max-w-[400px] opacity-20 dark:opacity-10">
        <svg viewBox="0 0 450 254" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 45h450M205 253V0M0 97h450M256 253V0M0 0v253M0 149h450M308 253V0M51 253V0M0 201h450M359 253V0M103 253V0M410 253V0M154 253V0" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="w-full max-w-[480px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Masuk ke Ticket<span className="text-brand-500">RS</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sistem Manajemen Tiket Rumah Sakit Terintegrasi
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 shadow-theme-xl backdrop-blur-sm">
          <form action={action} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="username"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
              {state?.errors?.username && (
                <p className="mt-1 text-xs text-error-500">{state.errors.username[0]}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-error-500">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <div className="rounded-xl bg-error-50 dark:bg-error-500/10 p-3 text-center">
                <p className="text-sm font-medium text-error-600 dark:text-error-400">
                  {state.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum punya akun? Hubungi Admin IT untuk pendaftaran.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} TicketRS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
