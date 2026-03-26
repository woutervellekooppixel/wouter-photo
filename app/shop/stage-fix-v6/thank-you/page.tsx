import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

export default function StageFixV6ThankYouPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Thanks for your purchase</CardTitle>
            <CardDescription>
              Your Stage Fix v6 order is confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">What happens next</p>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
                  <span>You’ll receive an email with your download and setup instructions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
                  <span>If you don’t see it within a few minutes, check your spam/promotions folder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
                  <span>Need help? Email <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">hello@wouter.photo</a>.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="sm:w-auto">
                <a href="/shop/stage-fix-v6">Back to Stage Fix v6</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="sm:w-auto">
                <a href="/shop">Browse the shop</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
