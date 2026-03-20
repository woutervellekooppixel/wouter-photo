"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type NotFoundVariant = "site" | "download";

export default function NotFoundClient({
  variant,
  redirectTo = "https://wouter.photo",
  redirectDelaySeconds = 30,
}: {
  variant: NotFoundVariant;
  redirectTo?: string;
  redirectDelaySeconds?: number;
}) {
  const shouldRedirect = variant === "download";
  const [countdown, setCountdown] = useState(redirectDelaySeconds);

  const redirectHost = useMemo(() => {
    try {
      return new URL(redirectTo).host;
    } catch {
      return redirectTo;
    }
  }, [redirectTo]);

  useEffect(() => {
    if (!shouldRedirect) return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = redirectTo;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [redirectTo, shouldRedirect]);

  if (variant === "site") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page doesn’t exist (or was moved).
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium"
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Transfer expired</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            This download link is no longer available. The files may have expired or been removed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
          <p className="text-sm text-gray-600">Need help or want to request a new link?</p>
          <a
            href="mailto:info@woutervellekoop.nl"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            info@woutervellekoop.nl
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">You will be redirected to {redirectHost} in</p>
          <div className="text-6xl font-bold text-gray-300">{countdown}</div>
          <p className="text-xs text-gray-400">seconds</p>
        </div>

        <div>
          <a
            href={redirectTo}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Or click here to go now
          </a>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">© Wouter.Photo</p>
        </div>
      </div>
    </div>
  );
}
