import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Stage Fix v6 – Preset workflow system for Lightroom & ACR – Wouter.Photo",
	description:
		"Stage Fix v6 isn’t a one-click look preset. It’s a modular workflow system for Lightroom Classic and Adobe Camera Raw: White Balance → Base → Color Fix → Noise/Detail → Highlights → Finish.",
	keywords: [
		"Stage Fix",
		"Lightroom presets",
		"Lightroom Classic",
		"Adobe Camera Raw",
		"concert photography",
		"LED green cast",
		"magenta spill",
		"workflow presets",
		"Wouter Vellekoop",
	],
	openGraph: {
		title: "Stage Fix v6 – Preset workflow system for Lightroom & ACR",
		description:
			"A modular preset system for Lightroom Classic and Adobe Camera Raw that treats editing as a workflow — not a gamble with a look.",
		url: "https://wouter.photo/shop/stage-fix-v6",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/manifest.json",
				width: 1200,
				height: 630,
				alt: "Stage Fix v6",
			},
		],
		locale: "en_US",
		alternateLocale: ["nl_NL"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Stage Fix v6 – Preset workflow system for Lightroom & ACR",
		description:
			"A modular preset system for Lightroom Classic and Adobe Camera Raw that treats editing as a workflow — not a gamble with a look.",
	},
	alternates: {
		canonical: "https://wouter.photo/shop/stage-fix-v6",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};
