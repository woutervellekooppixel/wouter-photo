import React from "react";
import type { Metadata } from "next";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginPreviewLightbox } from "@/components/PluginPreviewLightbox";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { ADOBE_EXCHANGE_EXPORT_EVERY_X_URL } from "@/lib/adobeExchange";

// ─── Update this when the price changes ───────────────────────────────────────
const PRICE = "$10";
const PRICE_ORIGINAL = "$15";

const steps = [
	{
		step: "01",
		title: "Install",
		description: "Get it from Adobe Exchange and install in Photoshop via Creative Cloud. One restart and it's ready.",
	},
	{
		step: "02",
		title: "Set X",
		description:
			"Choose the pixel interval — 1080px for Instagram carousels, 1920px for web banners, whatever your layout needs.",
	},
	{
		step: "03",
		title: "Export",
		description:
			"Run once. Every panel exports as a separate file at full document resolution. Perfectly aligned, every time.",
	},
];

const features = [
	{
		title: "Any pixel interval",
		body: "Set X to whatever your layout needs — 1080px for carousels, 1920px for banners, or anything in between. One setting, consistent output.",
	},
	{
		title: "Perfect alignment",
		body: "Every panel starts exactly where the previous one ended. No overlap, no gap, no manual adjustment after the fact.",
	},
	{
		title: "Full resolution output",
		body: "Exports at the document's pixel resolution. No surprise downscaling, no quality loss. What you designed is what you get.",
	},
	{
		title: "Replaces the guide workflow",
		body: "No guides. No manual slicing. No repetitive File › Export As per section. One operation handles the whole document.",
	},
	{
		title: "Works on very wide canvases",
		body: "Export As and Save for Web can behave unexpectedly on extremely wide files. Export Every X handles them reliably.",
	},
	{
		title: "One-time purchase",
		body: `${PRICE} on Adobe Exchange. No subscription, no license key, no expiry. Buy it once, use it.`,
	},
];

const faqs = [
	{
		q: "Can I export Instagram carousel slices (1080px / 1080×1350)?",
		a: "Yes. Set X to 1080px to export a long design into 1080px-wide panels. Your document height can be whatever you need.",
	},
	{
		q: "How do I split a panorama into equal parts in Photoshop?",
		a: "Set X to your desired panel width (for example 1920px) and run export. You get one file per segment with consistent alignment across all of them.",
	},
	{
		q: "How many panels will I get?",
		a: "Document width ÷ X, rounded up. A 3240px-wide canvas with X set to 1080px gives you three panels.",
	},
	{
		q: "Why not just use Photoshop slices?",
		a: "For very wide documents, slice-based workflows get tedious fast — guides, manual slice management, and Save for Web can be unreliable on big files. Export Every X focuses on fast, consistent panel exports by pixel interval.",
	},
	{
		q: "Is this the same as artboards?",
		a: "Not quite. Artboards are great when you can structure your design as separate boards from the start. Export Every X is for a single wide canvas where you want evenly sized exports without restructuring the file.",
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
		q: "How much does it cost?",
		a: `Export Every X is ${PRICE} (USD) on Adobe Exchange. One-time purchase.`,
	},
];

const testimonials = [
	{
		quote: "I used this for a long Instagram carousel. It turned a repetitive export job into a one-click routine — huge time saver.",
		name: "Sophie van Dijk",
		role: "Content creator",
	},
	{
		quote: "Perfect 1080px panels without guides. The alignment staying consistent across exports is what saves me the most time.",
		name: "Milan Koster",
		role: "Graphic designer",
	},
	{
		quote: "Splitting ultra-wide banners into 1920px segments used to be a pain. Now it's predictable and fast.",
		name: "Eva Janssen",
		role: "Web marketer",
	},
	{
		quote: "Export As kept acting weird on very wide docs. This workflow is more reliable for my biggest files.",
		name: "Noah Vermeer",
		role: "Photographer",
	},
];

export default function ExportEveryXShopPage() {
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
		name: "Export Every X",
		applicationCategory: "DesignApplication",
		operatingSystem: "Windows, macOS",
		isAccessibleForFree: false,
		offers: {
			"@type": "Offer",
			price: 10,
			priceCurrency: "USD",
			url: ADOBE_EXCHANGE_EXPORT_EVERY_X_URL,
		},
		url: "https://wouter.photo/shop/export-every-x",
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: "https://wouter.photo/" },
			{ "@type": "ListItem", position: 2, name: "Shop", item: "https://wouter.photo/shop" },
			{ "@type": "ListItem", position: 3, name: "Export Every X", item: "https://wouter.photo/shop/export-every-x" },
		],
	};

	const BuyButton = ({ label = `Get it on Adobe Exchange — ${PRICE}`, className = "" }: { label?: string; className?: string }) => (
		<Button asChild size="lg" className={className}>
			<a href={ADOBE_EXCHANGE_EXPORT_EVERY_X_URL} target="_blank" rel="noopener noreferrer">
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
								Export Every X — Photoshop Plugin
							</p>
							<div className="space-y-3">
								<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
									One canvas. Clean panels.
								</h1>
								<p className="text-base text-muted-foreground sm:text-lg">
									Slice a wide Photoshop document into evenly sized panels in one operation. No guides,
									no manual cropping, no repetitive File › Export As.
								</p>
								<p className="text-sm text-muted-foreground">
									Built for Instagram carousels, web banners, panoramic layouts and anything else
									where Photoshop's built-in export workflow starts to feel like a workaround.
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
						</div>

						<div className="lg:py-6 lg:pr-2">
							<PluginPreviewLightbox
								src="/cropevery.png"
								alt="Export Every X Photoshop plugin — slice export interface"
								width={2990}
								height={1766}
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

				{/* ── Demo PSD ─────────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="rounded-3xl border border-border bg-card px-6 py-6 sm:px-8 sm:py-8">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<p className="text-sm font-semibold tracking-tight">Free demo PSD</p>
								<p className="text-sm text-muted-foreground">
									A ready-made PSD set up to work with Export Every X. Drop your photos in and run the
									export — no setup needed.
								</p>
							</div>
							<Button asChild variant="outline" className="shrink-0 sm:w-auto">
								<a href="/crop-every-x_demo.psd" download>
									Download demo PSD
								</a>
							</Button>
						</div>
					</div>
				</section>

				{/* ── What you get ─────────────────────────────────────────────────── */}
				<section className="mt-10 sm:mt-14">
					<div className="rounded-3xl border border-border bg-card px-6 py-8 sm:px-8 sm:py-10">
						<h2 className="text-2xl font-semibold tracking-tight">What you get</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							One plugin. One operation. Consistent exports.
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
										Built because guides and slices were never the answer.
									</h2>
								</div>
								<p className="text-sm leading-relaxed text-muted-foreground">
									I am Wouter Vellekoop, a photographer who also does a lot of design work — Instagram
									carousels, event visuals, banners. At some point you end up with a canvas that is
									3000 pixels wide and needs to be split into clean 1080px panels.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									The standard Photoshop workflow for that is guides, manual slices, Export As — and
									it works until it doesn't. On very wide files it gets unreliable. On files you
									revisit and update, it gets tedious fast. I built Export Every X to replace that
									whole process with one setting and one click.
								</p>
								<p className="text-sm leading-relaxed text-muted-foreground">
									It doesn't do anything fancy. It just does the thing reliably, every time, without
									having to think about it.
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
								<h2 className="text-3xl font-semibold tracking-tight">Stop slicing by hand.</h2>
								<p className="text-sm text-muted-foreground sm:text-base">
									Set X once. Export all panels. Works on carousels, banners, panoramas — anything
									where you need a wide canvas split into consistent pieces.
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
