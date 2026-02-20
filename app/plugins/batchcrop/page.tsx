import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PluginPreviewLightbox } from "@/components/PluginPreviewLightbox";
import { ADOBE_EXCHANGE_BATCHCROP_URL } from "@/lib/adobeExchange";

const usps = [
	"Batch crop (bulk crop) large photo sets",
	"Crop multiple images consistently",
	"Fast, simple install",
	"Works with Photoshop CC",
	"No technical knowledge needed",
	"Paid plugin ($15)",
];

const steps = [
	{
		title: "Install the plugin",
		description:
			"Get it from Adobe Exchange and install it in Photoshop. (Details depend on your Photoshop version.)",
	},
	{
		title: "Pick your input",
		description:
			"Select the folder or set you want to process. The plugin runs through your selection as a batch (great for hundreds of photos).",
	},
	{
		title: "Set your crop",
		description:
			"Define your crop once, then apply it consistently across your entire set.",
	},
];

const faqs = [
	{
		q: "Can I crop multiple images at once in Photoshop?",
		a: "Yes. BatchCrop is made for bulk/batch cropping: you set your crop once and apply it across a set so you don’t have to repeat the same steps per file.",
	},
	{
		q: "Is this useful for a whole folder of photos?",
		a: "That’s the idea: pick an input set (often a folder/selection) and run the batch. It’s designed for large sets where manual cropping would be too slow.",
	},
	{
		q: "How do I apply the same crop to hundreds of photos?",
		a: "That’s what BatchCrop is for. You configure the crop once and run the batch so every image gets the same consistent crop without doing it manually per file.",
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
		q: "Can I control the crop settings?",
		a: "Yes. You set the crop parameters in the plugin, then it applies them in batch.",
	},
	{
		q: "Is this a good workflow for headshots, products, or event photos?",
		a: "Yes — anywhere you need a consistent crop across a set (for example: headshots, product catalog images, or a full event/gallery edit).",
	},
	{
		q: "Is this the same as Actions / Batch in Photoshop?",
		a: "Actions can work, but they often take more setup and can be brittle when your inputs vary. BatchCrop focuses specifically on repeatable cropping for large sets with a simple workflow.",
	},
	{
		q: "How much does it cost?",
		a: "BatchCrop costs $15 (USD) on Adobe Exchange.",
	},
];

export default function BatchCropPluginPage() {
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
		url: "https://wouter.photo/plugins/batchcrop",
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
				name: "BatchCrop",
				item: "https://wouter.photo/plugins/batchcrop",
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
							Photoshop plugin • Batch workflow
						</div>
						<div className="space-y-3">
							<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
								BatchCrop — batch crop photos in Photoshop
							</h1>
							<p className="text-base text-muted-foreground sm:text-lg">
								Bulk/batch crop a whole photo set consistently — set your crop once, run the batch, and stop repeating the same manual steps.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg" className="sm:w-auto">
								<a href={ADOBE_EXCHANGE_BATCHCROP_URL}>
									Get it on Adobe Exchange
								</a>
							</Button>
							<Button asChild size="lg" variant="outline" className="sm:w-auto">
								<a href="#how">How it works</a>
							</Button>
						</div>

						<ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
							{usps.map((usp) => (
								<li key={usp} className="flex items-start gap-2">
									<span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
									<span>{usp}</span>
								</li>
							))}
						</ul>
					</div>

					<div>
						<PluginPreviewLightbox
							src="/batchcrop.png"
							alt="BatchCrop Photoshop plugin preview (batch crop multiple photos)"
							width={1360}
							height={800}
							priority
						/>
					</div>
				</section>

				<section id="how" className="mt-14 sm:mt-20">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">In 3 steps</h2>
						<p className="text-sm text-muted-foreground">
							Keep it simple: install, configure, run.
						</p>
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
				</section>

				<section className="mt-14 sm:mt-20">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">Why this plugin?</CardTitle>
							<CardDescription>
								For when you need the same crop over and over, but don’t want to apply it manually to hundreds of files.
							</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">
							<p>
								BatchCrop helps you process large photo sets fast and consistently. If you’re searching for “crop multiple images in Photoshop” or “bulk crop a
								folder of photos”, this is the workflow: define the crop once, then let the plugin apply it across your set.
							</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-14 sm:mt-20">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
						<p className="text-sm text-muted-foreground">Short and practical.</p>
					</div>

					<div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
						{faqs.map((faq, idx) => (
							<details key={faq.q} className="group">
								<summary
									className="cursor-pointer list-none px-6 py-5 text-sm font-medium outline-none transition-colors hover:bg-accent/40"
								>
									<div className="flex items-center justify-between gap-4">
										<span>{faq.q}</span>
										<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
									</div>
								</summary>
								<div className="px-6 pb-6 text-sm text-muted-foreground">
									{faq.a}
								</div>
								{idx !== faqs.length - 1 ? <div className="h-px bg-border" /> : null}
							</details>
						))}
					</div>
				</section>

				<section className="mt-14 sm:mt-20">
					<div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold tracking-tight">Get it</h2>
								<p className="text-sm text-muted-foreground">Works with Photoshop CC. Install via Adobe Exchange / Creative Cloud.</p>
								<p className="text-sm text-muted-foreground">
									Questions? Email{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							<Button asChild size="lg" className="sm:w-auto">
								<a href={ADOBE_EXCHANGE_BATCHCROP_URL}>
									Open Adobe Exchange
								</a>
							</Button>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
