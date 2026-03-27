import React from "react";
import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { metadata as pageMetadata } from "./metadata";

export const metadata: Metadata = pageMetadata;

type StageFixVisualProps = {
	src?: string;
	alt: string;
	title: string;
	hint: string;
	className: string;
	priority?: boolean;
	sizes?: string;
};

function StageFixVisual({ src, alt, title, hint, className, priority = false, sizes }: StageFixVisualProps) {
	return (
		<div className={`relative overflow-hidden rounded-2xl border border-border bg-muted/20 ${className}`}>
			{src ? (
				<Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
			) : (
				<>
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_42%,rgba(0,0,0,0.18))]" />
					<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.55))]" />
					<div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
						<div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur">
							Placeholder
						</div>
						<div className="max-w-xs space-y-2">
							<p className="text-base font-semibold tracking-tight text-white sm:text-lg">{title}</p>
							<p className="text-xs text-white/75 sm:text-sm">{hint}</p>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

const heroVisual = {
	src: "/20251017-2025-10-17_Kane-Ahoy_Wouter-Vellekoop__V1_8693_3x2.jpg",
	alt: "Kane live at Ahoy photographed by Wouter Vellekoop",
	title: "Top campaign image",
	hint: "Replace this placeholder with your final header visual when it is ready.",
};

const stats = [
	{ value: "15", label: "folders in a fixed order" },
	{ value: "90", label: "working presets" },
	{ value: "15", label: "reset presets" },
	{ value: "1", label: "install zip" },
];

const reasons = [
	"Stage light is rarely one problem. It is usually white balance, color cast, clipped spots and noise at the same time.",
	"Most preset packs hit everything at once. That can look impressive on one frame and fall apart on the next fifty.",
	"Stage Fix splits the job into small folders, so you only correct what the image actually needs.",
];

const folderCards = [
	{
		code: "01",
		title: "White Balance",
		imageSrc: "",
		count: "20 presets + reset",
		examples: "Cool-Green 01-10, Warm-Magenta 01-10",
		description: "Fast first aid for LED green, cold spill, magenta wash and ugly mixed light.",
	},
	{
		code: "02",
		title: "Base",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Soundcheck, Doors Open, Showtime, Encore, Finale",
		description: "Pick your starting contrast and exposure shape before you style anything.",
	},
	{
		code: "03",
		title: "Red Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Light Gel, Warm Wash, Headliner, Fire, Alarm",
		description: "For red-heavy frames that kill skin tone and swallow detail.",
	},
	{
		code: "04",
		title: "Green Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Light Spill, Acid, Laser, Toxic, Nuclear",
		description: "Tames the sickly green cast that lives in LED rigs and haze.",
	},
	{
		code: "05",
		title: "Purple / UV Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Light Haze, Club, UV Wash, Blacklight, Beam Killer",
		description: "Controls purple and UV light before faces, fabrics and highlights fall apart.",
	},
	{
		code: "06",
		title: "Blue / Cyan Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Light Ice, Cool Wash, Deep Sea, Cyan Clamp, Arctic",
		description: "Keeps deep blue scenes moody without letting them turn dead or plastic.",
	},
	{
		code: "07",
		title: "Noise Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Whisper, Saver, Strong, Heavy, Emergency",
		description: "For high ISO files that need control without instantly going soft.",
	},
	{
		code: "08",
		title: "Detail Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Soft Focus, Front Row, Crisp, Razor, Crunch",
		description: "Adds bite, texture and presence when the frame needs more edge.",
	},
	{
		code: "09",
		title: "Highlights Fix",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Spot Saver, Lamp Tamer, Clip Guard, Hard Stop, Nuclear",
		description: "Pulls harsh spots and blown lamps back under control.",
	},
	{
		code: "10",
		title: "Finish: Black and White",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Clean, Silver, Punch, Grit, Noir",
		description: "A full black-and-white finish set for when color adds nothing.",
	},
	{
		code: "11",
		title: "Finish: Analogue",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Subtle, Classic, Warm, Grit, Heavy",
		description: "Adds film-like character without rebuilding the edit from zero.",
	},
	{
		code: "12",
		title: "Finish: Clean",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Natural, Rich, Punch, Bold, Max",
		description: "For polished, direct edits that still feel photographic.",
	},
	{
		code: "13",
		title: "Finish: Moody",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Low Key, Backstage, Smoke, Deep, Noir",
		description: "For darker, atmosphere-first edits with control instead of mush.",
	},
	{
		code: "14",
		title: "Finish: Soft",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Skin, Velvet, Dreamy, Glow, Ultra",
		description: "A softer finishing lane when the image wants lift rather than grit.",
	},
	{
		code: "15",
		title: "Finish: Matte",
		imageSrc: "",
		count: "5 presets + reset",
		examples: "Subtle, Lift, Fade, Film, Heavy",
		description: "For flatter, filmier endings without losing all contrast structure.",
	},
];

const workflow = [
	{
		title: "Neutralize the mess",
		description: "Start with White Balance and, if needed, one color-fix folder. Correct the actual light problem first.",
	},
	{
		title: "Choose your base",
		description: "Pick the Base preset that matches the frame: Soundcheck, Doors Open, Showtime, Encore or Finale.",
	},
	{
		title: "Rescue the file",
		description: "Use Noise Fix, Detail Fix and Highlights Fix only where the image needs help.",
	},
	{
		title: "Finish once",
		description: "Choose one finishing lane: Black and White, Analogue, Clean, Moody, Soft or Matte.",
	},
];

const audiences = {
	for: [
		"Concert photographers dealing with brutal LED rigs, gels, haze and spotlights",
		"Event and documentary photographers who want faster consistency across a whole set",
		"Anyone editing in Lightroom Classic or Adobe Camera Raw who prefers control over one-click looks",
	],
	notFor: [
		"Photographers who want one preset to decide everything for them",
		"Lightroom Mobile-first workflows",
		"People who only edit JPEGs and expect the same correction range as RAW",
	],
};

const faqs = [
	{
		q: "What exactly am I buying?",
		a: "Stage Fix v6 includes 15 folders, 90 working presets and 15 reset presets in one install zip for Lightroom Classic and Adobe Camera Raw.",
	},
	{
		q: "Is this only for concert photography?",
		a: "No. It was built there because stage light is brutal. The same workflow is useful anywhere light gets ugly, mixed or inconsistent.",
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
		q: "How do I receive the product?",
		a: "After checkout through Payhip, you get the download and instructions by email. If the mail does not show up, check spam/promotions or email hello@wouter.photo.",
	},
	{
		q: "Does it work in Lightroom Mobile?",
		a: "These presets are made for Lightroom Classic and Adobe Camera Raw first. Mobile import may be possible in some cases, but that is not the main workflow.",
	},
];

export default function StageFixV6Page() {
	const payhipUrl = process.env.NEXT_PUBLIC_PAYHIP_STAGE_FIX_URL || "https://payhip.com/";
	const hasPayhipUrl = payhipUrl !== "https://payhip.com/";
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
				<section className="overflow-hidden rounded-3xl border border-border bg-card">
					<div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
						<div className="space-y-6">
							<div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
								Lightroom Classic + Adobe Camera Raw - concert-tested preset system
							</div>

							<div className="space-y-4">
								<p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">Stage Fix v6</p>
								<h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
									Fix brutal stage light fast.
								</h1>
								<p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
									A modular preset system for photographers who are done fighting LED green, magenta spill, UV wash,
									clipped spots and high ISO noise one frame at a time.
								</p>
								<p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
									This is not a one-click look pack. It is a fixed workflow that helps you get to clean, consistent,
									usable edits faster without flattening every image into the same thing.
								</p>
							</div>

							<StageFixVisual
								src={heroVisual.src}
								alt={heroVisual.alt}
								title={heroVisual.title}
								hint={heroVisual.hint}
								className="aspect-[3/2] max-w-2xl"
								priority
								sizes="(max-width: 1024px) 100vw, 720px"
							/>

							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
								{stats.map((stat) => (
									<div key={stat.label} className="rounded-2xl border border-border bg-background px-4 py-4">
										<p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
										<p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
									</div>
								))}
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<Button asChild size="lg" className="sm:w-auto" disabled={!hasPayhipUrl}>
									<a href={payhipUrl} target="_blank" rel="noreferrer">
										Get Stage Fix v6
									</a>
								</Button>
								<Button asChild size="lg" variant="outline" className="sm:w-auto">
									<a href="#inside">See what is inside</a>
								</Button>
							</div>

							{!hasPayhipUrl ? (
								<p className="text-sm text-destructive">Set `NEXT_PUBLIC_PAYHIP_STAGE_FIX_URL` to enable the buy button.</p>
							) : null}

							<p className="text-sm text-muted-foreground">
								Built by concert photographer Wouter Vellekoop. One install zip, fixed folder order, real-world names,
								and a workflow that still leaves room for your own style.
							</p>
						</div>

						<Card className="border-border bg-background">
							<CardHeader className="space-y-3">
								<CardTitle className="text-2xl">Why normal presets fall apart on stage</CardTitle>
								<CardDescription>
									Concert light is not one problem. So one preset should not pretend to solve it.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<ul className="grid gap-3">
									{reasons.map((reason) => (
										<li key={reason} className="flex items-start gap-3">
											<span className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-foreground/70" />
											<span>{reason}</span>
										</li>
									))}
								</ul>
								<div className="rounded-2xl border border-border bg-card px-4 py-4">
									<p className="text-sm font-medium text-foreground">Stage Fix approach</p>
									<p className="mt-2 text-sm text-muted-foreground">
										White Balance -&gt; Base -&gt; one targeted fix -&gt; rescue detail/highlights -&gt; one finisher.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				<section id="inside" className="mt-12 sm:mt-16">
					<div className="space-y-3">
						<h2 className="text-3xl font-semibold tracking-tight">What is inside the pack</h2>
						<p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
							Each folder does one job, each has its own reset, and the names tell you what kind of frame they are meant
							to rescue or finish.
						</p>
					</div>

					<div className="mt-6 grid gap-4 lg:grid-cols-3">
						{folderCards.map((folder) => (
							<Card key={folder.code} className="bg-card">
								<div className="px-6 pt-6">
									<StageFixVisual
										src={folder.imageSrc}
										alt={`${folder.title} preview`}
										title={`Folder ${folder.code}: ${folder.title}`}
										hint="Replace with a real before/after, preset result or folder-specific promo visual."
										className="aspect-[3/2]"
										sizes="(max-width: 1024px) 100vw, 33vw"
									/>
								</div>
								<CardHeader className="space-y-3">
									<div className="flex items-center justify-between gap-3">
										<p className="text-sm font-medium text-muted-foreground">Folder {folder.code}</p>
										<p className="text-xs text-muted-foreground">{folder.count}</p>
									</div>
									<CardTitle className="text-xl">{folder.title}</CardTitle>
									<CardDescription>{folder.description}</CardDescription>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground">
									<p className="font-medium text-foreground">Examples</p>
									<p className="mt-1">{folder.examples}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="mt-12 sm:mt-16">
					<div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
						<Card>
							<CardHeader className="space-y-2">
								<CardTitle className="text-2xl">How you actually use it</CardTitle>
								<CardDescription>
									Fast enough for volume. Controlled enough that the edit still feels like yours.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								{workflow.map((step, idx) => (
									<div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-background px-4 py-4">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground">
											{idx + 1}
										</div>
										<div>
											<p className="font-medium text-foreground">{step.title}</p>
											<p className="mt-1">{step.description}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="space-y-2">
								<CardTitle className="text-2xl">The real selling point</CardTitle>
								<CardDescription>
									It does not force one look across a whole shoot. It gives you a repeatable route to a usable file.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								<p>
									That is the difference between a preset pack that looks good in a promo and a preset system you still
									trust after a brutal show, dark venue or mixed-light event.
								</p>
								<p>
									You are not buying mystery sliders. You are buying decisions that already have names: Soundcheck,
									Headliner, Laser, Beam Killer, Clip Guard, Backstage, Velvet, Film. That makes the pack faster to learn
									and easier to trust under pressure.
								</p>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-border bg-background px-4 py-4">
										<p className="font-medium text-foreground">Good for</p>
										<p className="mt-1">Large selects, ugly light, fast turnarounds, consistent gallery delivery.</p>
									</div>
									<div className="rounded-2xl border border-border bg-background px-4 py-4">
										<p className="font-medium text-foreground">Not pretending to be</p>
										<p className="mt-1">A one-click magic look that edits your whole set for you.</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				<section className="mt-12 sm:mt-16">
					<Card>
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl">Who it is for</CardTitle>
							<CardDescription>Strongest when consistency matters more than surprise.</CardDescription>
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
							<p className="text-sm text-muted-foreground">Short, practical, purchase-focused.</p>
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
					<div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
							<div className="max-w-2xl space-y-3">
								<h2 className="text-3xl font-semibold tracking-tight">Ready to stop fighting stage light?</h2>
								<p className="text-sm text-muted-foreground sm:text-base">
									Stage Fix v6 gives you a fixed route from ugly light to a stable file, without forcing one look across
									every image. Import once, work in order, keep what helps, reset what does not.
								</p>
								<p className="text-sm text-muted-foreground sm:text-base">
									Questions before buying? Email{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>
								</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
								<Button asChild size="lg" className="sm:w-auto" disabled={!hasPayhipUrl}>
									<a href={payhipUrl} target="_blank" rel="noreferrer">
										Buy Stage Fix v6
									</a>
								</Button>
								<Button asChild size="lg" variant="outline" className="sm:w-auto">
									<a href="#inside">Review the folders</a>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
