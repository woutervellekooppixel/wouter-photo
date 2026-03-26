"use client";

import MobileFloatingContactButton from "./MobileFloatingContactButton";
import { usePathname } from "next/navigation";

export default function FloatingContactWrapper() {
  const pathname = usePathname();
  // Verberg op about, admin, download en alle slug-pagina's (zoals /kerst-in-de-nieuwe-kerk-ro)
  const isAdmin = pathname?.startsWith("/admin");
  const isAbout = pathname === "/about" || pathname?.startsWith("/about");
  const isDownload = pathname?.includes("download");
  // Verberg op alle root-slug pagina's (bv. /kerst-in-de-nieuwe-kerk-ro)
  const isSlugPage = pathname?.match(/^\/[a-z0-9\-]+$/i) && !isAdmin && !isAbout && !isDownload;

  if (isAdmin || isAbout || isDownload || isSlugPage) return null;
  return (
    <>
      <MobileFloatingContactButton />
    </>
  );
}
