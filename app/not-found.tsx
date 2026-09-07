import NotFoundClient from "@/components/NotFoundClient";

export default function NotFound() {
  // Keep the shared not-found boundary static so public pages can use ISR.
  // Download-host branding is resolved by the client after hydration.
  return (
    <NotFoundClient
      redirectTo="https://www.wouter.photo"
      redirectDelaySeconds={30}
    />
  );
}
