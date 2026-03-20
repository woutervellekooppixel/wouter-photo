import React from "react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

const usps = [
	"Not a look — a system (technical → creative)",
	"Designed to stack (one job per preset)",
	"Levels per step (mild → wild) for control",
	"Reset per step (undo only that step)",
	"Built for the worst light (concert / LED / UV / spots)",
];

const workflow = [
	{
		title: "White Balance",
		description:
			"Start with fast WB correction. For example WB 11–14 if an LED setup is too green, or WB 5–7 if the light is too magenta.",
	},
	{
		title: "Base",
		description: "Pick your base contrast and exposure balance. Usually Base 2–3 for a neutral start.",
	},
	{
		title: "Color Fix (if needed)",
		description:
			"Tame dominant colors from LED or gels. For example Red 2 for red overload, or Purple 3 for UV light.",
	},
	{
		title: "Noise",
		description:
			"At high ISO, choose Noise 2–4 for a balance between noise reduction and detail.",
	},
	{
		title: "Detail",
		description: "Add micro-contrast and sharpness. Often Detail 2–3 for concert work.",
	},
	{
		title: "Highlights",
		description:
			"Recover clipping from spots and lamps. For example Highlights 3 if front spots are too harsh.",
	},
	{
		title: "Finisher",
		description:
			"Pick one finishing style: Clean, Moody, Analogue, Matte, Soft or Black & White. Done.",
	},
];

const stepOverview = [
	{
		code: "01 — White Balance",
		description:
			"20 levels + reset. Fast correction for extreme color temperature and tint (Cool/Green → Warm/Magenta), designed for problematic stage lighting.",
	},
	{
		code: "02 — Base",
		description: "5 levels + reset. A neutral base for exposure, contrast and tonal balance.",
	},
	{ code: "03 — Red Fix", description: "5 levels + reset. Tames dominant red gel lighting." },
	{ code: "04 — Green Fix", description: "5 levels + reset. Corrects LED green cast that often lives in skin tones." },
	{ code: "05 — Purple / UV Fix", description: "5 levels + reset. For purple/UV light that makes skin and clothing look unnatural." },
	{ code: "06 — Blue / Cyan Fix", description: "5 levels + reset. Controls deep blue LED sets without killing the mood." },
	{ code: "07 — Noise", description: "5 levels + reset. Balanced noise reduction and sharpening for high ISO situations." },
	{ code: "08 — Detail", description: "5 levels + reset. Texture, clarity, dehaze and sharpening for extra definition." },
	{ code: "09 — Highlights", description: "5 levels + reset. Recovers harsh spots and clipping without flattening the whole image." },
	{
		code: "10–15 — Finishers",
		description:
			"Black & White, Analogue, Clean, Moody, Soft and Matte — multiple variants per style to finish your edit.",
	},
];

const audiences = {
	for: [
		"Concert photographers (LED light, haze, gels, high ISO)",
		"Event and documentary photographers (fast + consistent)",
		"Photographers with large shoots (repeatable workflow)",
	],
	notFor: [
		"Photographers who only want one-click looks without decisions",
		"Photographers who never shoot RAW or don’t use Lightroom/ACR",
	],
};

const faqs = [
	{
		q: "Is this only for concert photography?",
		a: "No. It was developed there because the light is extreme. But the workflow (WB → Base → color → detail → finish) works for almost any kind of photography.",
	},
	{
		q: "Does it work with RAW and JPEG?",
		a: "It’s designed for RAW. JPEG can work too, but you’ll have less room for correction.",
	},
	{
		q: "Do I need to use every step?",
		a: "No. It’s a checklist. Use only what you need.",
	},
	{
		q: "Does it work in Lightroom Mobile?",
		a: "These presets are made for Lightroom Classic and Adobe Camera Raw. In some cases you can import them into Lightroom Mobile, but it’s not the primary workflow.",
	},
	{
		q: "How do I install the presets?",
		a: "Import the preset folder via the Presets panel in Lightroom Classic or Adobe Camera Raw. The steps will appear as folders in your preset list.",
	},
	{
		q: "What if my white balance is still off?",
		a: "Try a different WB preset, or fine-tune with the regular Temp/Tint sliders.",
	},
	{
		q: "Can I combine this with my own presets?",
		a: "Yes. Stage Fix works well as a technical base before your own creative presets.",
	},
	{
		q: "How do I get the download?",
		a: "After purchase, you’ll receive an email with your receipt, download link, and instructions.",
	},
	{
		q: "I didn’t receive the email — what should I do?",
		a: "Check your spam/promotions folder first. If it’s still missing, email hello@wouter.photo and include the email address you used at checkout.",
	},
	{
		q: "Do I get updates?",
		a: "If updates are released, you’ll typically receive an email and/or an updated download link.",
	},
	{
		q: "What’s the refund policy?",
		a: "Refunds are handled according to the policy shown at checkout. If you run into a technical issue, email hello@wouter.photo and I’ll help you get it working.",
	},
	{
		q: "What license do I get?",
		a: "Please refer to the license terms shown at checkout/receipt. If you need a studio/team license, email hello@wouter.photo.",
	},
];

export default function StageFixV6Page() {
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
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://wouter.photo/",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Shop",
				item: "https://wouter.photo/shop",
			},
			{
				"@type": "ListItem",
				position: 3,
				name: "Stage Fix v6",
				item: "https://wouter.photo/shop/stage-fix-v6",
			},
		],
	};

	return (
		<main className="min-h-screen bg-background text-foreground">
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
			<div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
				<section className="grid gap-10 lg:grid-cols-2 lg:items-center">
					<div className="space-y-6">
						<div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
							Lightroom Classic + Adobe Camera Raw • Preset system
						</div>

						<div className="space-y-3">
							<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Stage Fix v6</h1>
							<p className="text-base text-muted-foreground sm:text-lg">
								A modular preset system for Lightroom Classic and Adobe Camera Raw that treats editing as a workflow — not a gamble with a “look”.
							</p>
							<p className="text-base text-muted-foreground sm:text-lg">
								Built for chaotic stage lighting. Useful for any photographer who wants consistent results.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button size="lg" className="sm:w-auto" disabled>
								Buy Stage Fix v6
							</Button>
							<Button asChild size="lg" variant="outline" className="sm:w-auto">
								<a href="#how">How it works</a>
							</Button>
						</div>

						<div className="text-xs text-muted-foreground">
							<span className="font-medium text-foreground">Policies:</span>{" "}
							<a className="underline underline-offset-4" href="/terms-of-service">
								Terms
							</a>
							<span> · </span>
							<a className="underline underline-offset-4" href="/privacy-policy">
								Privacy
							</a>
							<span> · </span>
							<a className="underline underline-offset-4" href="/refund-policy">
								Refunds
							</a>
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
						<Card>
							<CardHeader className="space-y-2">
								<CardTitle className="text-2xl">Workflow, not a look</CardTitle>
								<CardDescription>
									Stage Fix v6 is built as a technical checklist: stabilize first, then finish.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<p className="font-medium text-foreground">Fixed order</p>
								<ul className="grid gap-2">
									<li className="flex items-start gap-2">
										<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
										<span>White Balance → Base → Color Fix → Noise/Detail → Highlights → Finish</span>
									</li>
								</ul>
								<p>
									Most presets are built as one look: great on one photo, unpredictable on the rest. Stage Fix v6 is made of small, stackable corrections (mild → wild) so you can stabilize your edit step by step.
								</p>
							</CardContent>
						</Card>
					</div>
				</section>

				<section id="how" className="mt-12 sm:mt-16">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold tracking-tight">How to use it</h2>
						<p className="text-sm text-muted-foreground">Use Stage Fix as a checklist. Per step you pick one preset, or you skip the step.</p>
					</div>

					<div className="mt-6 grid gap-4 lg:grid-cols-3">
						{workflow.map((step, idx) => (
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

				<section className="mt-12 sm:mt-16">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">Full step overview</CardTitle>
							<CardDescription>01–15, with levels and a reset per folder.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-muted-foreground">
							<ul className="grid gap-3 sm:grid-cols-2">
								{stepOverview.map((item) => (
									<li key={item.code} className="space-y-1">
										<p className="font-medium text-foreground">{item.code}</p>
										<p>{item.description}</p>
									</li>
								))}
							</ul>
							<p className="text-xs">
								Disclaimer: results depend on light, camera and the RAW file.
							</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-12 sm:mt-16">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">Who it’s for</CardTitle>
							<CardDescription>When consistency matters more than one unique look.</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-2">
							<div className="space-y-3">
								<p className="font-medium text-foreground">For</p>
								<ul className="grid gap-2">
									{audiences.for.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="space-y-3">
								<p className="font-medium text-foreground">Not for</p>
								<ul className="grid gap-2">
									{audiences.notFor.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground opacity-70" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
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
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">About Wouter / origin</CardTitle>
							<CardDescription>Born from concert photography, built for speed and predictability.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-muted-foreground">
							<p>
								Stage Fix v6 was developed by Wouter Vellekoop, concert photographer. Stage lighting is one of the least predictable kinds of light: LED panels with green casts, magenta spill from backlight, deep blue washes, and harsh spots that blow highlights.
							</p>
							<p>
								The solution became a system: small corrections you stack and repeat. Stabilize the light first, then add style.
							</p>
						</CardContent>
					</Card>
				</section>

				<section className="mt-12 sm:mt-16">
					<div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold tracking-tight">Buy / questions</h2>
								<p className="text-sm text-muted-foreground">
									Installation: import the preset folder via the Presets panel in Lightroom Classic or Adobe Camera Raw. The steps will appear as folders in your preset list.
								</p>
								<p className="text-sm text-muted-foreground">
									Questions? Email{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							{BUY_URL ? (
								<Button asChild size="lg" className="sm:w-auto">
									<a href={BUY_URL} target="_blank" rel="noopener noreferrer">
										Buy Stage Fix v6
									</a>
								</Button>
							) : (
								<Button size="lg" className="sm:w-auto" disabled>
									Buy Stage Fix v6
								</Button>
							)}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
