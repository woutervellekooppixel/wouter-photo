import React from "react";
import type { Metadata } from "next";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginPreviewLightbox } from "@/components/PluginPreviewLightbox";
import { ADOBE_EXCHANGE_EXPORT_EVERY_X_URL } from "@/lib/adobeExchange";

const usps = [
	"Export (slice) a canvas every X pixels",
	"Perfect alignment across exports",
	"Instagram carousel-ready panels (e.g. 1080px)",
	"No guides or repetitive manual work",
	"Paid plugin ($10)",
];

const steps = [
	{
		title: "Install",
		description: "Get it from Adobe Exchange and install it in Photoshop.",
	},
	{
		title: "Set X",
		description: "Choose the pixel interval (e.g. 1080px for an Instagram carousel panel width).",
	},
	{
		title: "Export",
		description: "Run once and get separate files for each segment.",
	},
];

const faqs = [
	{
		q: "Can I export Instagram carousel slices (1080px / 1080×1350)?",
		a: "Yes. Set X to 1080px to export a long design into 1080px-wide panels. Your document height can be whatever you need (e.g. 1080×1350 per panel).",
	},
	{
		q: "How do I split a panorama into equal parts in Photoshop?",
		a: "If you have one very wide panorama/canvas and want evenly sized exports, set X (for example: 1920px or 1080px) and export. You’ll get one file per segment with consistent alignment.",
	},
	{
		q: "Can I export 1920px-wide segments for web headers or banners?",
		a: "Yes. X is the pixel interval, so you can set it to common widths like 1920px (or any value you need) and export a wide design as separate files.",
	},
	{
		q: "How many panels will I get?",
		a: "It depends on your document width and the X value. A simple rule of thumb is: number of panels ≈ document width ÷ X (rounded up).",
	},
	{
		q: "My Photoshop document is extremely wide. Export As / Save for Web struggles — can this help?",
		a: "That’s exactly the use case. Instead of relying on a slice-heavy workflow or manually exporting sections, Export Every X exports the document in consistent pixel intervals (panels), which is often more reliable for very wide files.",
	},
	{
		q: "Why not just use Photoshop slices?",
		a: "For very wide documents, slice-based workflows can get tedious (guides, manual slice management) and some users run into reliability/performance issues when exporting many slices. Export Every X focuses on fast, consistent panel exports by pixel interval.",
	},
	{
		q: "Is this the same as artboards?",
		a: "Not quite. Artboards are great when you can structure your design as separate boards. Export Every X is aimed at a single wide canvas where you want evenly sized exports (for example: carousel panels every 1080px).",
	},
	{
		q: "How do I install the plugin?",
		a:
			"Install it via Adobe Exchange / Creative Cloud. In general: open the Adobe Exchange listing, click to install (you may be prompted to sign in), then complete the install in the Creative Cloud desktop app. Restart Photoshop after installation. The exact menu/location can vary by Photoshop version.",
	},
	{
		q: "I installed it from Adobe Exchange — where do I find it in Photoshop?",
		a:
			"After installing, restart Photoshop. The plugin usually appears under the Plugins menu or under Extensions (the exact place depends on your Photoshop version). If you don’t see it, check that Creative Cloud shows it as installed and try restarting again.",
	},
	{
		q: "Which Photoshop versions are supported?",
		a: "Tested with Photoshop CC. It may work on other versions, but that’s not guaranteed.",
	},
	{
		q: "Does this work on Photoshop mobile / iPad?",
		a: "No. This plugin is made for the desktop version of Photoshop (macOS/Windows). It doesn’t run on Photoshop for iPad or other mobile/web versions.",
	},
	{
		q: "Can I set the pixel interval myself?",
		a: "Yes. You define the X value (pixels per export segment) in the plugin.",
	},
	{
		q: "Does it keep the export resolution?",
		a: "It exports each segment as its own file at the document’s pixel resolution. Pick X to match your desired panel width (e.g. 1080px).",
	},
	{
		q: "How much does it cost?",
		a: "Export Every X costs $10 (USD) on Adobe Exchange.",
	},
];

export default function ExportEveryXPluginPage() {
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
		url: "https://wouter.photo/plugins/export-every-x",
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://wouter.photo/",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Plugins",
				item: "https://wouter.photo/plugins",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: "Export Every X",
				item: "https://wouter.photo/plugins/export-every-x",
			},
		],
	};

	return (
		<main className="min-h-screen bg-background text-foreground">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
			/>
			<div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
				<section className="grid gap-10 lg:grid-cols-2 lg:items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
							Photoshop plugin • Export
						</div>
						<div className="space-y-3">
							<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Export Every X — Photoshop slice export plugin</h1>
							<p className="text-base text-muted-foreground sm:text-lg">
								Export (slice) huge wide Photoshop documents into panels every X pixels — perfect for Instagram carousel exports (e.g. 1080px).
							</p>
						</div>

						<div className="flex items-baseline gap-3">
							<span className="text-3xl font-semibold tracking-tight text-foreground">$10</span>
							<span className="text-sm text-muted-foreground line-through">$15</span>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg" className="sm:w-auto">
								<a href={ADOBE_EXCHANGE_EXPORT_EVERY_X_URL}>Get it on Adobe Exchange</a>
							</Button>
							<Button asChild size="lg" variant="outline" className="sm:w-auto">
								<a href="#how">How it works</a>
							</Button>
						</div>

						<ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
							{usps.map((usp) => (
								<li key={usp} className="flex items-start gap-2">
									<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
									<span>{usp}</span>
								</li>
							))}
						</ul>
					</div>

					<div>
						<PluginPreviewLightbox
							src="/cropevery.png"
							alt="Export Every X Photoshop plugin preview (export 1080px carousel slices)"
							width={2990}
							height={1766}
							priority
						/>
					</div>
				</section>

				<section id="how" className="mt-12 sm:mt-16">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
						<p className="text-sm text-muted-foreground">One operation from start to export.</p>
					</div>

					<div className="mt-6 grid gap-4 lg:grid-cols-3">
						{steps.map((step, idx) => (
							<Card key={step.title} className="bg-card">
								<CardHeader className="space-y-2">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-medium">
											{idx + 1}
										</div>
										<CardTitle className="text-lg">{step.title}</CardTitle>
									</div>
									<CardDescription className="text-sm">{step.description}</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>

					<div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-2">
								<p className="text-sm font-medium text-foreground">Demo file</p>
								<p className="text-sm text-muted-foreground">
									Free demo PSD to test the workflow quickly — it’s set up to work perfectly with Export Every X.
								</p>
								<p className="text-sm text-muted-foreground">
									Tip: if guides are not visible yet, turn on Guides and use the PSD as a template — drop/paste your own photos into it and run the export.
								</p>
							</div>
							<Button asChild variant="outline" className="w-full sm:w-auto">
								<a href="/crop-every-x_demo.psd" download>
									Download demo PSD
								</a>
							</Button>
						</div>
					</div>
				</section>

				<section className="mt-12 sm:mt-16">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">What it does</CardTitle>
							<CardDescription>
								Wouter Photo – Export Every X is a precision export plugin for Adobe Photoshop.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 text-sm text-muted-foreground">
							<p>
								It automatically divides very wide canvases into evenly sized segments and exports each section as a separate file. Ideal for Instagram carousel
								exports (1080px panels), panoramic layouts, web banners, and grid-based designs.
							</p>
							<p>
								If you’ve ever built a super-wide Photoshop file with lots of “slices” and then struggled to export everything cleanly at high resolution,
								this workflow is for you: set X once, run export once, and you get consistent panels.
							</p>
							<div className="space-y-3">
								<p className="font-medium text-foreground">What you can do</p>
								<ul className="grid gap-2 sm:grid-cols-2">
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>Export a canvas every X pixels (e.g. every 1080px for Instagram carousel panels)</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>Automatically generate separate image files for each segment</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>Maintain perfect alignment across all exports</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>Eliminate manual guides and repetitive cropping</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>Prepare carousel-ready visuals in seconds</span>
									</li>
								</ul>
							</div>
							<p>
								Instead of manually creating guides and slicing sections one by one, Export Every X handles the entire workflow in a single operation.
							</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-12 sm:mt-16">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">Why it matters</CardTitle>
							<CardDescription>Precision and speed for wide layouts.</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">
							<p>
								When working with wide layouts for Instagram carousels, website headers, or campaign visuals, precision and speed are essential. Export Every X
								lets you take one long design and export it into consistent panels (e.g. 1080px slices) without guides or manual slice management.
							</p>
							<p className="mt-4">Built for creators who value efficiency and clean execution.</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-12 sm:mt-16">
					<div className="overflow-hidden rounded-2xl border border-border bg-card">
						<div className="space-y-2 px-6 py-5">
							<h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
							<p className="text-sm text-muted-foreground">Short and practical.</p>
						</div>
						<div className="h-px bg-border" />
						{faqs.map((faq, idx) => (
							<details key={faq.q} className="group">
								<summary className="cursor-pointer list-none px-6 py-5 text-sm font-medium outline-none transition-colors hover:bg-accent/40">
									<div className="flex items-center justify-between gap-4">
										<span>{faq.q}</span>
										<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
									</div>
								</summary>
								<div className="px-6 pb-6 text-sm text-muted-foreground">{faq.a}</div>
								{idx !== faqs.length - 1 ? <div className="h-px bg-border" /> : null}
							</details>
						))}
					</div>
				</section>

				<section className="mt-12 sm:mt-16">
					<div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold tracking-tight">Get it</h2>
								<p className="text-sm text-muted-foreground">
									Tested with Photoshop CC. Install via Adobe Exchange / Creative Cloud.
								</p>
								<p className="text-sm text-muted-foreground">
									Questions? Email{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							<Button asChild size="lg" className="sm:w-auto">
								<a href={ADOBE_EXCHANGE_EXPORT_EVERY_X_URL}>Open Adobe Exchange</a>
							</Button>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
