"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HIDDEN_ROUTES = new Set([
  "portfolio",
  "about",
  "admin",
  "api",
  "webhook",
  "cron",
  "debug",
]);

export default function HeaderWrapper() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  // Single-segment, non-system routes are download pages -> hide global header
  const isDownloadPage =
    segments.length === 1 && !HIDDEN_ROUTES.has(segments[0]);

  if (isDownloadPage) return null;
  return <Header />;
}
