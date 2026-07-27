"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Nette eindpagina voor verlopen transfers: geen auto-redirect meer (de
// klant werd vroeger na 2,5s weggebonjourd), wél een één-klik knop om een
// nieuwe link aan te vragen (mailt Wouter via de server).
export default function ExpiredRedirect({
  destination = "https://www.wouter.photo",
  title = "This link has expired",
  description = "This download is no longer available.",
  slug,
}: {
  destination?: string;
  title?: string;
  description?: string;
  slug?: string;
}) {
  const [requestState, setRequestState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const destText = useMemo(() => {
    try {
      const u = new URL(destination);
      return u.host;
    } catch {
      return destination;
    }
  }, [destination]);

  const requestNewLink = async () => {
    if (!slug || requestState === "sending" || requestState === "sent") return;
    setRequestState("sending");
    try {
      const res = await fetch(`/api/expired-request/${encodeURIComponent(slug)}`, {
        method: "POST",
      });
      setRequestState(res.ok ? "sent" : "error");
    } catch {
      setRequestState("error");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-white/80">{description}</p>

        <div className="mt-6 flex flex-col gap-3">
          {slug && (
            <button
              onClick={requestNewLink}
              disabled={requestState === "sending" || requestState === "sent"}
              className="inline-flex items-center justify-center rounded-md bg-white text-black px-4 py-2 font-medium hover:bg-white/90 transition disabled:opacity-70"
            >
              {requestState === "sent"
                ? "Request sent — you'll hear from Wouter soon ✓"
                : requestState === "sending"
                ? "Sending request…"
                : "Request a new link"}
            </button>
          )}
          {requestState === "error" && (
            <p className="text-sm text-red-400">
              Something went wrong — please email{" "}
              <a href="mailto:hello@wouter.photo" className="underline">
                hello@wouter.photo
              </a>
              .
            </p>
          )}

          <a
            href={destination}
            className="inline-flex items-center justify-center rounded-md border border-white/20 text-white px-4 py-2 font-medium hover:bg-white/5 transition"
          >
            Go to {destText}
          </a>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-white/20 text-white px-4 py-2 font-medium hover:bg-white/5 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
