import { headers } from "next/headers";
import NotFoundClient from "@/components/NotFoundClient";

export default async function NotFound() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase();

  const isDownloadHost = host.includes("wouter.download");

  return (
    <NotFoundClient
      variant={isDownloadHost ? "download" : "site"}
      redirectTo="https://wouter.photo"
      redirectDelaySeconds={30}
    />
  );
}
