"use client";

import FloatingContactButton from "./FloatingContactButton";
import MobileFloatingContactButton from "./MobileFloatingContactButton";
import { usePathname } from "next/navigation";

export default function FloatingContactWrapper() {
  const pathname = usePathname();
  const hideFloatingContact =
    pathname?.startsWith("/about") ||
    pathname === "/about" ||
    pathname?.includes("download") ||
    pathname?.startsWith("/admin");

  if (hideFloatingContact) return null;
  return (
    <>
      <FloatingContactButton />
      <MobileFloatingContactButton />
    </>
  );
}
