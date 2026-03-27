import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

export default function ShopOverview() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
				<div className="space-y-3">
					<div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
						Shop
					</div>
					<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Tools that earn their keep.</h1>
					<p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
						A Lightroom preset system and two Photoshop plugins — built to solve specific problems
						that kept showing up in real work.
					</p>
				</div>

				<div className="mt-10 grid gap-4 lg:grid-cols-3">

					{/* Stage Fix v6 */}
					<Card className="h-full">
						<CardHeader className="flex h-full flex-col space-y-4">
							<div className="overflow-hidden rounded-xl border border-border bg-background">
								<BeforeAfterSlider
									beforeSrc="/12.jpg"
									afterSrc="/11.jpg"
									beforeAlt="Before Stage Fix — mixed stage light, color cast"
									afterAlt="After Stage Fix — corrected and finished"
									sizes="(max-width: 1024px) 100vw, 33vw"
									hint=""
								/>
							</div>
							<div className="flex flex-1 flex-col justify-between gap-5">
								<div className="space-y-1">
									<CardTitle className="text-xl">Stage Fix v6</CardTitle>
									<CardDescription>
										A modular preset system for concerts, festivals, clubs and any shoot with ugly
										mixed light. Correct first, stabilize, then finish — in that order.
									</CardDescription>
								</div>
								<div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
									<div className="flex items-baseline gap-2">
										<span className="text-sm font-medium text-foreground">$9.99</span>
										<span className="text-xs text-muted-foreground">· Lightroom Classic &amp; ACR · Instant download</span>
									</div>
									<Button asChild className="w-full">
										<Link href="/shop/stage-fix-v6">View details</Link>
									</Button>
								</div>
							</div>
						</CardHeader>
					</Card>

					{/* BatchCrop */}
					<Card className="h-full">
						<CardHeader className="flex h-full flex-col space-y-4">
							<div className="overflow-hidden rounded-xl border border-border bg-background">
								<Link href="/shop/batchcrop" className="block">
									<Image
										src="/batchcrop.png"
										alt="BatchCrop Photoshop plugin"
										width={1360}
										height={800}
										className="aspect-[3/2] w-full object-cover"
									/>
								</Link>
							</div>
							<div className="flex flex-1 flex-col justify-between gap-5">
								<div className="space-y-1">
									<CardTitle className="text-xl">BatchCrop</CardTitle>
									<CardDescription>
										Batch crop a whole photo set in Photoshop. Set your crop once, run the batch,
										get consistent results across every file.
									</CardDescription>
								</div>
								<div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
									<div className="flex items-baseline gap-2">
										<span className="text-sm font-medium text-foreground">$15</span>
										<span className="text-xs text-muted-foreground">· Photoshop · Adobe Exchange</span>
									</div>
									<Button asChild className="w-full">
										<Link href="/shop/batchcrop">View details</Link>
									</Button>
								</div>
							</div>
						</CardHeader>
					</Card>

					{/* Export Every X */}
					<Card className="h-full">
						<CardHeader className="flex h-full flex-col space-y-4">
							<div className="overflow-hidden rounded-xl border border-border bg-background">
								<Link href="/shop/export-every-x" className="block">
									<Image
										src="/cropevery.png"
										alt="Export Every X Photoshop plugin"
										width={2990}
										height={1766}
										className="aspect-[3/2] w-full object-cover"
									/>
								</Link>
							</div>
							<div className="flex flex-1 flex-col justify-between gap-5">
								<div className="space-y-1">
									<CardTitle className="text-xl">Export Every X</CardTitle>
									<CardDescription>
										Slice a wide Photoshop canvas into clean panels every X pixels. One operation —
										no guides, no manual cropping, no Export As per section.
									</CardDescription>
								</div>
								<div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
									<div className="flex items-baseline gap-2">
										<span className="text-sm font-medium text-foreground">$10</span>
										<span className="text-xs text-muted-foreground">· Photoshop · Adobe Exchange</span>
									</div>
									<Button asChild className="w-full">
										<Link href="/shop/export-every-x">View details</Link>
									</Button>
								</div>
							</div>
						</CardHeader>
					</Card>

				</div>

				<p className="mt-10 text-sm text-muted-foreground">
					Photoshop plugins install via Adobe Exchange and Creative Cloud. Presets are delivered as a direct download.
				</p>
			</div>
		</main>
	);
}
