import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

export default function ShopOverview() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto w-full max-w-5xl px-6 py-14 sm:py-20">
				<div className="space-y-3">
					<div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
						Shop
					</div>
					<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Shop</h1>
					<p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
						Plugins en presets om sneller én consistenter te werken.
					</p>
				</div>

				<div className="mt-10 grid gap-4 lg:grid-cols-2">
					<Card className="lg:col-span-2">
						<CardHeader className="space-y-4">
							<div className="overflow-hidden rounded-xl border border-border bg-background">
								<Link href="/shop/stage-fix-v6" className="block">
									<Image
										src="/20251017-2025-10-17_Kane-Ahoy_Wouter-Vellekoop__V1_8693_3x2.jpg"
										alt="Stage Fix v6 concert preset system"
										width={2048}
										height={1366}
										className="h-auto w-full"
									/>
								</Link>
							</div>
							<div className="space-y-1">
								<CardTitle className="text-xl">Stage Fix v6</CardTitle>
								<CardDescription>
									A modular Lightroom Classic and Adobe Camera Raw preset system built for brutal stage light, ugly color casts, clipped spots and fast, consistent delivery.
								</CardDescription>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<p className="text-sm text-muted-foreground">
									90 working presets, 15 resets, one install zip.
								</p>
								<Button asChild>
									<Link href="/shop/stage-fix-v6">View details</Link>
								</Button>
							</div>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="space-y-3">
							<div className="overflow-hidden border border-border bg-background">
								<Link href="/shop/batchcrop" className="block">
									<Image
										src="/batchcrop.png"
										alt="BatchCrop Photoshop plugin"
										width={1360}
										height={800}
										className="h-auto w-full"
									/>
								</Link>
							</div>
							<div className="space-y-1">
								<CardTitle className="text-xl">BatchCrop</CardTitle>
								<CardDescription>
									Batch (bulk) crop multiple images in Photoshop. Set your crop once, apply it across a whole set. Paid plugin ($15).
								</CardDescription>
							</div>
							<Button asChild>
								<Link href="/shop/batchcrop">View details</Link>
							</Button>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="space-y-3">
							<div className="overflow-hidden border border-border bg-background">
								<Link href="/shop/export-every-x" className="block">
									<Image
										src="/cropevery.png"
										alt="Export Every X Photoshop plugin"
										width={2990}
										height={1766}
										className="h-auto w-full"
									/>
								</Link>
							</div>
							<div className="space-y-1">
								<CardTitle className="text-xl">Wouter Photo – Export Every X</CardTitle>
								<CardDescription>
									Export (slice) a huge canvas every X pixels (e.g. 1080px). Ideal for Instagram carousels, banners, and grid-based layouts. Paid plugin ($10).
								</CardDescription>
							</div>
							<Button asChild>
								<Link href="/shop/export-every-x">View details</Link>
							</Button>
						</CardHeader>
					</Card>
				</div>

				<p className="mt-10 text-sm text-muted-foreground">
					Photoshop plugins are installed via Adobe Exchange and Creative Cloud. Presets are delivered as a direct download.
				</p>
			</div>
		</main>
	);
}
