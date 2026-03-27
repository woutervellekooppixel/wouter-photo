import React from "react";
import type { Metadata } from "next";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginPreviewLightbox } from "@/components/PluginPreviewLightbox";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { ADOBE_EXCHANGE_BATCHCROP_URL } from "@/lib/adobeExchange";

// ─── Update this when the price changes ───────────────────────────────────────
const PRICE = "$15";
const PRICE_ORIGINAL = "$20";

const steps = [
	{
		step: "01",
		title: "Install",
		description: "Get it from Adobe Exchange and install in Photoshop via Creative Cloud. One restart and it's ready.",
	},
	{
		step: "02",
		title: "Set your crop",
		description:
			"Define the crop once — dimensions, position, whatever the job needs. BatchCrop applies it consistently to every file in the set.",
	},
	{
		step: "03",
		title: "Run the batch",
		description:
			"Select your folder or set and run. Every image gets the same crop. No clicking through files one by one.",
	},
];

const features = [
	{
		title: "Set once, apply everywhere",
		body: "Define your crop parameters once. BatchCrop applies them consistently across the entire set — no per-file adjustments, no drift.",
	},
	{
		title: "Works on large sets",
		body: "Built for hundreds of files. Event coverage, product catalogs, headshot sessions — anything where manual cropping is too slow.",
	},
	{
		title: "Consistent output",
		body: "Every image in the set gets the same crop. No tiny differences between frames, no manual checks after the fact.",
	},
	{
		title: "Simpler than Actions",
		body: "Photoshop Actions can work, but they're brittle when inputs vary. BatchCrop focuses specifically on repeatable cropping with a straightforward workflow.",
	},
	{
		title: "Works on desktop Photoshop",
		body: "macOS and Windows. Install once via Adobe Exchange and Creative Cloud.",
	},
	{
		title: "One-time purchase",
		body: `${PRICE} on Adobe Exchange. No subscription, no license key, no expiry. Buy it once, use it.`,
	},
];

const faqs = [
	{
		q: "Can I crop multiple images at once in Photoshop?",
		a: "Yes. BatchCrop is built for bulk/batch cropping: you set your crop once and apply it across a set so you don't have to repeat the same steps per file.",
	},
	{
		q: "Is this useful for a whole folder of photos?",
		a: "That's the core use case. Pick your input set, configure the crop once, run the batch. Designed for large sets where manual cropping would take too long.",
	},
	{
		q: "Is this a good workflow for headshots, products, or event photos?",
		a: "Yes — anywhere you need a consistent crop across a set. Headshots, product catalog images, event galleries, real estate photography. Same crop, every file.",
	},
	{
		q: "Is this the same as Photoshop Actions?",
		a: "Actions can work, but they often take more setup and can be brittle when your inputs vary. BatchCrop focuses specifically on repeatable cropping for large sets with a simple workflow.",
	},
	{
		q: "How do I install it?",
		a: "Open the Adobe Exchange listing, click install (you may be prompted to sign in), then complete the install in the Creative Cloud desktop app. Restart Photoshop after installation.",
	},
	{
		q: "Where do I find it in Photoshop after installing?",
		a: "After restarting Photoshop, look under the Plugins menu or Extensions — the exact location depends on your version. If it's not there, check that Creative Cloud shows it as installed.",
	},
	{
		q: "Which Photoshop versions are supported?",
		a: "Tested with the desktop version of Adobe Photoshop on macOS and Windows. It may work on other versions, but that's not guaranteed. Not available for Photoshop on iPad.",
	},
	{
		q: "Can I control the crop settings?",
		a: "Yes. You define the crop parameters in the plugin, then it applies them in batch.",
	},
	{
		q: "How much does it cost?",
		a: `BatchCrop is ${PRICE} (USD) on Adobe Exchange. One-time purchase.`,
	},
	{
		q: "What if it doesn't work for me?",
		a: "If BatchCrop isn't what you expected, email hello@wouter.photo within 30 days of purchase for a full refund. No questions asked.",
	},
];

const testimonials = [
	{
		quote: "I had hundreds of photos to crop for a gallery. Setting it once and running the batch saved me hours.",
		name: "Lotte de Groot",
		role: "Event photographer",
	},
	{
		quote: "The consistency is the killer feature. No more tiny crop differences between images — and way faster than doing it manually.",
		name: "Thomas Bakker",
		role: "Studio assistant",
	},
	{
		quote: "For product photos this is a game changer. One crop setup, same result across the whole set.",
		name: "Nina Smit",
		role: "E-commerce",
	},
	{
		quote: "Actions were too brittle for my inputs. This is a simpler workflow and saves a lot of repetitive clicking.",
		name: "Jasper Meijer",
		role: "Designer",
	},
];

export default function BatchCropShopPage() {
	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.q,
			acceptedAnswer: { "@type": "Answer", text: faq.a },
		})),
	};

	const softwareSchema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "BatchCrop",
		applicationCategory: "DesignApplication",
		operatingSystem: "Windows, macOS",
		isAccessibleForFree: false,
		offers: {
			"@type": "Offer",
			price: 15,
			priceCurrency: "USD",
			url: ADOBE_EXCHANGE_BATCHCROP_URL,
		},
		url: "https://wouter.photo/shop/batchcrop",
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://wouter.photo/" },
			{ "@type": "ListItem", position: 2, name: "Shop", item: "https://wouter.photo/shop" },
			{ "@type": "ListItem", position: 3, name: "BatchCrop", item: "https://wouter.photo/shop/batchcrop" },
		],
	};

	const BuyButton = ({ label = `Get it on Adobe Exchange — ${PRICE}`, className = "" }: { label?: string; className?: string }) => (
		<Button asChild size="lg" className={className}>
			<a href={ADOBE_EXCHANGE_BATCHCROP_URL} target="_blank" rel="noopener noreferrer">
				{label}
			</a>
		</Button>
	);

	return (
		<main className="min-h-screen bg-background text-foreground">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

			<div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">

				{/* ── Hero ─────────────────────────────────────────────────────────── */}
				<section className="overflow-hidden rounded-3xl border border-border bg-card">
					<div className="grid gap-8 px-6 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-2 lg:items-center">
						<div className="space-y-5">
							<p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
								BatchCrop — Photoshop Plugin
							</p>
							<div className="space-y-3">
								<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
									Set your crop once. Run the batch.
								</h1>
								<p className="text-base text-muted-foreground sm:text-lg">
									Batch crop a whole photo set in Photoshop with consistent results — without clicking
									through files one by one.
								</p>
								<p className="text-sm text-muted-foreground">
									Built for event photographers, product sets, headshots and anything else where
									manually cropping hundreds of images is not a real option.
								</p>
							</div>

							<div className="flex items-baseline gap-3">
								<span className="text-3xl font-semibold tracking-tight">{PRICE}</span>
								<span className="text-sm text-muted-foreground line-through">{PRICE_ORIGINAL}</span>
								<span className="text-sm text-muted-foreground">· One-time on Adobe Exchange</span>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<BuyButton label={`Get it on Adobe Exchange — ${PRICE}`} />
								<Button asChild size="lg" variant="outline">
									<a href="#how">How it works</a>
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">30-day money-back guarantee. No questions asked.</p>
						</div>

						<div className="lg:py-6 lg:pr-2">
							<PluginPreviewLightbox
								src="/batchcrop.png"
								alt="BatchCrop Photoshop plugin — batch crop interface"
								width={1360}
								height={800}
								priority
							/>
						</div>
					</div>

					{/* Steps */}
					<div id="how" className="grid gap-3 px-6 pb-8 pt-6 sm:grid-cols-3 sm:px-8 sm:pb-10">
						{steps.map((s) => (
							<div key={s.step} className="rounded-2xl border border-border bg-background/70 px-4 py-4">
								<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{s.step}</p>
								<p className="mt-2 text-base font-semibold tracking-tight">{s.title}</p>
								<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
							</div>
						))}
					</div>
				</section>

				{/* ── What you get ─────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="rounded-3xl border border-border bg-card px-6 py-8 sm:px-8 sm:py-10">
						<h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							One plugin. Consistent crops across the whole set.
						</p>
						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							{features.map((f) => (
								<div key={f.title} className="rounded-2xl border border-border bg-background/70 px-5 py-4">
									<p className="text-sm font-semibold tracking-tight">{f.title}</p>
									<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── Why I built this ─────────────────────────────────────────────── */}
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
										Built because 300 photos don't crop themselves.
									</h2>
								</div>
								<p className="text-sm leading-relaxed text-muted-foreground">
									I am Wouter Vellekoop, a concert and event photographer. After a busy shoot you
									can easily end up with several hundred photos that all need the same crop before
									delivery — headshots for a client, product images for a catalog, gallery selects
									for a venue.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									Doing that manually in Photoshop, one file at a time, is slow and inconsistent.
									Actions work but they're brittle — one file with slightly different dimensions and
									the whole batch breaks. I built BatchCrop to handle this cleanly: set the crop
									once, run it across the set, get consistent output without babysitting the process.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									It's not glamorous, but it saves real time on every job where consistency matters.
								</p>
								<div className="pt-2">
									<BuyButton />
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				{/* ── Testimonials ─────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<Card>
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl">What people say</CardTitle>
						</CardHeader>
						<CardContent>
							<TestimonialsCarousel items={testimonials} />
						</CardContent>
					</Card>
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
									Stop cropping one by one.
								</h2>
								<p className="text-sm text-muted-foreground sm:text-base">
									Set your crop once. Run the batch. Get consistent results across the whole set —
									whether that's 20 or 2000 images.
								</p>
								<p className="text-sm text-muted-foreground">
									Questions before buying?{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-semibold tracking-tight">{PRICE}</span>
									<span className="text-sm text-muted-foreground line-through">{PRICE_ORIGINAL}</span>
								</div>
								<p className="text-sm text-muted-foreground">One-time on Adobe Exchange.</p>
								<BuyButton label="Get it on Adobe Exchange" />
							</div>
						</div>
					</div>
				</section>

			</div>
		</main>
	);
}
