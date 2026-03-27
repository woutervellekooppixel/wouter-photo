import React from "react";
import type { Metadata } from "next";
import Image from "next/image";

import AnimatedStatsGrid from "@/components/AnimatedStatsGrid";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

// ─── Update this when the price changes ───────────────────────────────────────
const PRICE = "$9.99";

const stats = [
	{ value: 90, label: "working presets — correction, stabilization, finishing" },
	{ value: 15, label: "folders in a fixed order, so you never hunt during an edit" },
	{ value: 15, label: "reset presets to undo a step cleanly" },
	{ value: 1, label: "install zip — import once, done" },
];

const comparisons = [
	{
		beforeSrc: "/12.jpg",
		afterSrc: "/11.jpg",
		beforeAlt: "Before Stage Fix — mixed stage light, green cast, clipped highlights",
		afterAlt: "After Stage Fix — corrected white balance, recovered highlights, controlled noise",
		caption: "Mixed spotlights, green LED wash, clipped highlights. Three folders, about forty seconds.",
	},
	{
		beforeSrc: "/52.jpg",
		afterSrc: "/51.jpg",
		beforeAlt: "Before Stage Fix — harsh backlight, heavy color cast",
		afterAlt: "After Stage Fix — balanced exposure, corrected color cast",
		caption: "Heavy backlight, crushed shadows. Same system, different frame.",
	},
];

const systemSteps = [
	{
		step: "01",
		title: "Correct",
		description:
			"Fix white balance, color casts and ugly mixed light first. Get the file to neutral before you do anything creative.",
	},
	{
		step: "02",
		title: "Stabilize",
		description:
			"Recover highlights, control noise, bring the file back into shape. Fix the technical problems before adding style.",
	},
	{
		step: "03",
		title: "Finish",
		description:
			"Add the final look once the image is technically under control. Your own style goes here — or use the included finishing presets.",
	},
];

const faqs = [
	{
		q: "What exactly am I buying?",
		a: "Stage Fix v6 is a Lightroom preset system with 15 folders, 90 working presets and 15 reset presets in one install zip for Lightroom Classic and Adobe Camera Raw.",
	},
	{
		q: "Why is this a preset system instead of one preset?",
		a: "Because one preset is rarely enough when the light is actually difficult. Stage Fix is built as a preset system so you can correct white balance, color casts, noise, highlights, detail and finishing in separate steps instead of hoping one click fixes everything.",
	},
	{
		q: "Is this only for concert photography?",
		a: "No. It was built in concert pits because stage light is brutal, but the same workflow also works for festivals, clubs, events, backstage, venue photography and any shoot with ugly mixed light.",
	},
	{
		q: "Do I need to use every folder on every photo?",
		a: "No. The whole point is that you do not. Treat it like a checklist: fix only what the frame needs, then stop.",
	},
	{
		q: "Can I still use my own look presets?",
		a: "Yes. Stage Fix works well as the technical base before your own creative preset or finishing style.",
	},
	{
		q: "How do I install it?",
		a: "Import the install zip through the Presets panel in Lightroom Classic or Adobe Camera Raw. The folders appear in order.",
	},
	{
		q: `Why does this cost ${PRICE}?`,
		a: "Because it works. Most preset packs are built for demo images in controlled light. This one was built across thousands of real delivery edits where the light was green, the spots were clipping and the deadline was that evening.",
	},
];

export default function StageFixV6Page() {
	const payhipUrl = process.env.NEXT_PUBLIC_PAYHIP_STAGE_FIX_URL || "https://payhip.com/";
	const hasPayhipUrl = payhipUrl !== "https://payhip.com/";

	const productSchema = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "Stage Fix v6",
		description:
			"Stage Fix v6 is a modular Lightroom preset system with 90 presets + 15 reset presets for Lightroom Classic and Adobe Camera Raw, built for concerts, festivals, clubs, events, backstage work and other mixed-light editing.",
		category: "Lightroom Presets",
		offers: {
			"@type": "Offer",
			price: "9.99",
			priceCurrency: "USD",
			availability: "https://schema.org/InStock",
		},
		brand: {
			"@type": "Brand",
			name: "Wouter.Photo",
		},
		image: ["https://wouter.photo/20251017-2025-10-17_Kane-Ahoy_Wouter-Vellekoop__V1_8693_3x2.jpg"],
		url: "https://wouter.photo/shop/stage-fix-v6",
	};

	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.q,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.a,
			},
		})),
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://wouter.photo/" },
			{ "@type": "ListItem", position: 2, name: "Shop", item: "https://wouter.photo/shop" },
			{ "@type": "ListItem", position: 3, name: "Stage Fix v6", item: "https://wouter.photo/shop/stage-fix-v6" },
		],
	};

	const BuyButton = ({ label = `Buy Stage Fix v6 — ${PRICE}`, className = "" }: { label?: string; className?: string }) => (
		<Button asChild size="lg" className={className} disabled={!hasPayhipUrl}>
			<a href={payhipUrl} target="_blank" rel="noreferrer">
				{label}
			</a>
		</Button>
	);

	return (
		<main className="min-h-screen bg-background text-foreground">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

			<div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">

				{/* ── Hero ─────────────────────────────────────────────────────────── */}
				<section className="overflow-hidden rounded-3xl border border-border bg-card">
					<div className="space-y-5 px-6 pt-8 sm:px-8 sm:pt-10">
						<p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
							Stage Fix v6 — Lightroom Preset System
						</p>

						<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
							<div className="space-y-3">
								<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
									Fix ugly light fast.
								</h1>
								<p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
									A modular preset system for the moment the light turns green, the spots clip out and
									you still have 200 frames to deliver by morning.
								</p>
							</div>

							<div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
								<p className="text-3xl font-semibold tracking-tight">{PRICE}</p>
								<p className="text-sm text-muted-foreground">One-time. Instant download.</p>
								<BuyButton />
								{!hasPayhipUrl && (
									<p className="text-xs text-destructive">Set `NEXT_PUBLIC_PAYHIP_STAGE_FIX_URL` to enable.</p>
								)}
							</div>
						</div>

						{/* Before/after 1 */}
						<div className="space-y-2">
							<BeforeAfterSlider
								beforeSrc={comparisons[0].beforeSrc}
								afterSrc={comparisons[0].afterSrc}
								beforeAlt={comparisons[0].beforeAlt}
								afterAlt={comparisons[0].afterAlt}
								priority
								sizes="100vw"
								hint=""
							/>
							<p className="text-xs text-muted-foreground">{comparisons[0].caption}</p>
						</div>
					</div>

					{/* Stats + system steps */}
					<div className="grid gap-10 px-6 pb-8 pt-6 sm:px-8 sm:pb-10 lg:grid-cols-2 lg:items-start">
						<div className="space-y-4">
							<h2 className="text-xl font-semibold tracking-tight">The system</h2>
							<p className="text-sm text-muted-foreground">
								Most presets are one-click. Stage Fix is a workflow. You correct the file first,
								stabilize it, then apply your look — in that order, every time. That is why it
								works when the light is brutal and one preset would not.
							</p>
							<div className="grid gap-3 sm:grid-cols-3">
								{systemSteps.map((s) => (
									<div key={s.step} className="rounded-2xl border border-border bg-background/70 px-4 py-4">
										<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{s.step}</p>
										<p className="mt-2 text-base font-semibold tracking-tight">{s.title}</p>
										<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
									</div>
								))}
							</div>
						</div>

						<div className="lg:pt-1">
							<AnimatedStatsGrid stats={stats} />
						</div>
					</div>
				</section>

				{/* ── Second comparison ────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="overflow-hidden rounded-3xl border border-border bg-card">
						<div className="space-y-2 px-6 pt-8 sm:px-8 sm:pt-10">
							<h2 className="text-2xl font-semibold tracking-tight">Same system, different frame.</h2>
							<p className="text-sm text-muted-foreground">
								Stage Fix was not built for one specific type of light. It works across concerts, festivals, clubs,
								events and backstage — anywhere the light is unpredictable and you need to deliver fast.
							</p>
						</div>
						<div className="px-6 pb-8 pt-4 sm:px-8 sm:pb-10 space-y-2">
							<BeforeAfterSlider
								beforeSrc={comparisons[1].beforeSrc}
								afterSrc={comparisons[1].afterSrc}
								beforeAlt={comparisons[1].beforeAlt}
								afterAlt={comparisons[1].afterAlt}
								sizes="100vw"
								hint=""
							/>
							<p className="text-xs text-muted-foreground">{comparisons[1].caption}</p>
						</div>
					</div>
				</section>

				{/* ── Why I made this ──────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<Card className="overflow-hidden border-border bg-card">
						<CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[160px_1fr] lg:items-start">
							<div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted/20 lg:mt-1">
								<Image
									src="/2022_NSJF-Fri_1179.jpg"
									alt="Wouter Vellekoop"
									fill
									sizes="(max-width: 1024px) 160px, 160px"
									className="object-cover"
								/>
							</div>
							<div className="space-y-4">
								<div>
									<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
										Why I built this
									</p>
									<h2 className="mt-1 text-xl font-semibold tracking-tight">
										Built from real deadlines, not demo images.
									</h2>
								</div>
								<p className="text-sm leading-relaxed text-muted-foreground">
									I am Wouter Vellekoop, a concert photographer. Most preset packs looked fine in the
									promo shot — controlled light, clean exposure, already half-decent out of camera.
									They fell apart the moment the light turned green, or the spot clipped, or there were
									three different color sources in the same frame.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									Stage Fix was built across thousands of real delivery edits. It is not a look. It is
									a system: get the file to a usable state first, then apply whatever style you want on
									top. That is the order. It works because that is the only order that actually works.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									I use the same presets across concerts, festivals, club shows, backstage frames and
									fast event work. Whenever the light is unpredictable and the turnaround is short,
									this is what I open.
								</p>
								<div className="pt-2">
									<BuyButton />
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* ── What is included ─────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="rounded-3xl border border-border bg-card px-6 py-8 sm:px-8 sm:py-10">
						<h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
						<p className="mt-1 text-sm text-muted-foreground">One zip. Import. Done.</p>
						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							{[
								{
									title: "90 working presets",
									body: "Organized into correction, stabilization and finishing. Each folder does one job — use what the frame needs, skip what it does not.",
								},
								{
									title: "15 folders in a fixed order",
									body: "The folders appear in the right order after import. No renaming, no reorganizing. Open Lightroom, start editing.",
								},
								{
									title: "15 reset presets",
									body: "Undo any step cleanly. If a correction goes too far, one click takes you back. No manual slider hunting.",
								},
								{
									title: "Works with your own style",
									body: "Stage Fix handles the technical cleanup. Your creative preset or finishing touch goes on top, same as always.",
								},
								{
									title: "Lightroom Classic + Adobe Camera Raw",
									body: "One install zip works in both. Import once through the Presets panel — the folders appear in both.",
								},
								{
									title: "No subscription",
									body: `${PRICE} once. No ongoing fees, no license keys, no expiry. Download it, use it, keep it.`,
								},
							].map((item) => (
								<div key={item.title} className="rounded-2xl border border-border bg-background/70 px-5 py-4">
									<p className="text-sm font-semibold tracking-tight">{item.title}</p>
									<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── FAQ ──────────────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="overflow-hidden rounded-2xl border border-border bg-card">
						<div className="space-y-1 px-6 py-5">
							<h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
							<p className="text-sm text-muted-foreground">Short answers before you buy.</p>
						</div>
						<div className="h-px bg-border" />
						{faqs.map((faq, idx) => (
							<details key={faq.q} className="group">
								<summary className="cursor-pointer list-none px-6 py-5 text-sm font-medium outline-none transition-colors hover:bg-accent/40">
									<div className="flex items-center justify-between gap-4">
										<span>{faq.q}</span>
										<span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
									</div>
								</summary>
								<div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
								{idx !== faqs.length - 1 && <div className="h-px bg-border" />}
							</details>
						))}
					</div>
				</section>

				{/* ── Final CTA ────────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
							<div className="max-w-2xl space-y-3">
								<h2 className="text-3xl font-semibold tracking-tight">
									Stop fighting the light. Fix it.
								</h2>
								<p className="text-sm text-muted-foreground sm:text-base">
									One install. 90 presets. A system that works in the exact situations where one
									preset does not.
								</p>
								<p className="text-sm text-muted-foreground">
									Questions before buying?{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
								<p className="text-3xl font-semibold tracking-tight">{PRICE}</p>
								<p className="text-sm text-muted-foreground">One-time. Instant download.</p>
								<BuyButton />
							</div>
						</div>
					</div>
				</section>

			</div>
		</main>
	);
}
