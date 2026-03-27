import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Download Stage Fix v6 — Wouter.Photo",
	robots: { index: false, follow: false },
};

const installSteps = [
	"Download and unzip the file.",
	"Open Lightroom Classic. Go to the Develop module.",
	"In the Presets panel (left side), click the + icon and choose Import Presets.",
	"Select the .zip file you downloaded. Lightroom imports all 15 folders in the correct order.",
	"The Stage Fix folders appear at the top of your Presets panel, ready to use.",
];

export default async function StageFixDownloadPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;

	if (!token) {
		return (
			<main className="min-h-screen bg-background text-foreground flex items-center">
				<div className="mx-auto w-full max-w-2xl px-6 py-20 space-y-4 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">No download token found</h1>
					<p className="text-sm text-muted-foreground">
						This link is missing a download token. Check the email you received, or{" "}
						<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
							contact us
						</a>
						.
					</p>
					<p className="text-sm text-muted-foreground">
						Lost the email?{" "}
						<Link href="/shop/resend" className="underline underline-offset-4">
							Request a new link here.
						</Link>
					</p>
				</div>
			</main>
		);
	}

	const downloadApiUrl = `/api/presets/stage-fix-v6?token=${encodeURIComponent(token)}`;

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto w-full max-w-2xl px-6 py-20">
				<div className="space-y-8 rounded-3xl border border-border bg-card p-8 sm:p-10">

					{/* Header */}
					<div className="space-y-2">
						<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
							Stage Fix v6 — Lightroom Preset System
						</p>
						<h1 className="text-3xl font-semibold tracking-tight">Your download is ready.</h1>
						<p className="text-sm text-muted-foreground">
							Click the button below to download the install zip. The link works a limited number of
							times — keep this page or the email for re-downloads.
						</p>
					</div>

					{/* Download button */}
					<div>
						<Button asChild size="lg">
							<a href={downloadApiUrl}>Download Stage Fix v6</a>
						</Button>
					</div>

					{/* Install instructions */}
					<div className="space-y-4 border-t border-border pt-6">
						<h2 className="text-base font-semibold tracking-tight">How to install</h2>
						<ol className="space-y-3 text-sm text-muted-foreground">
							{installSteps.map((step, i) => (
								<li key={i} className="flex gap-3">
									<span className="mt-0.5 shrink-0 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span>{step}</span>
								</li>
							))}
						</ol>
						<p className="text-sm text-muted-foreground">
							Also works in Adobe Camera Raw: open any raw file in Camera Raw, go to the Presets panel
							and use Import Presets.
						</p>
					</div>

					{/* Support */}
					<div className="border-t border-border pt-6">
						<p className="text-sm text-muted-foreground">
							Link expired or already used up?{" "}
							<Link href="/shop/resend" className="underline underline-offset-4">
								Request a new one here
							</Link>
							{" "}or email{" "}
							<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
								hello@wouter.photo
							</a>
							.
						</p>
					</div>

				</div>
			</div>
		</main>
	);
}
