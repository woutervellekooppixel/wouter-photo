"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ExpiredRedirect({
  destination = "https://wouter.photo",
  delayMs = 2500,
  title = "Deze link is verlopen",
  description = "De download is niet meer beschikbaar.",
}: {
  destination?: string;
  delayMs?: number;
  title?: string;
  description?: string;
}) {
  const secondsTotal = Math.max(0, Math.round(delayMs / 1000));
  const [secondsLeft, setSecondsLeft] = useState(secondsTotal);

  const destText = useMemo(() => {
    try {
      const u = new URL(destination);
      return u.host;
    } catch {
      return destination;
    }
  }, [destination]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      window.location.href = destination;
    }, delayMs);

    if (secondsTotal > 0) {
      const interval = window.setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => {
        window.clearTimeout(t);
        window.clearInterval(interval);
      };
    }

    return () => window.clearTimeout(t);
  }, [destination, delayMs, secondsTotal]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-white/80">{description}</p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={destination}
            className="inline-flex items-center justify-center rounded-md bg-white text-black px-4 py-2 font-medium hover:bg-white/90 transition"
          >
            Ga naar {destText}
          </a>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-white/20 text-white px-4 py-2 font-medium hover:bg-white/5 transition"
          >
            Terug naar home
          </Link>

          {secondsTotal > 0 ? (
            <p className="text-sm text-white/60">
              Je wordt automatisch doorgestuurd over {secondsLeft}s…
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
