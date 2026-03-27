import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Stage Fix v6 – Lightroom Presets For Concert, Event & Bad Stage Light – Wouter.Photo",
	description:
		"90 modular presets + 15 resets for Lightroom Classic and Adobe Camera Raw. Built to fix LED green, magenta spill, UV wash, clipped spots and high ISO concert files fast.",
	keywords: [
		"Stage Fix",
		"Lightroom presets",
		"Lightroom Classic",
		"Adobe Camera Raw",
		"concert photography",
		"concert presets",
		"event photography presets",
		"stage lighting presets",
		"high ISO presets",
		"LED green cast",
		"magenta spill",
		"workflow presets",
		"concert photography editing",
		"Wouter Vellekoop",
	],
	openGraph: {
		title: "Stage Fix v6 – Fix brutal stage light fast",
		description:
			"90 modular presets + 15 resets for Lightroom Classic and Adobe Camera Raw. Fix LED green, UV wash, clipped spots and noisy concert files without one-click nonsense.",
		url: "https://wouter.photo/shop/stage-fix-v6",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/20251017-2025-10-17_Kane-Ahoy_Wouter-Vellekoop__V1_8693_3x2.jpg",
				width: 2048,
				height: 1366,
				alt: "Kane live at Ahoy photographed by Wouter Vellekoop",
			},
		],
		locale: "en_US",
		alternateLocale: ["nl_NL"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Stage Fix v6 – Fix brutal stage light fast",
		description:
			"90 modular presets + 15 resets for Lightroom Classic and Adobe Camera Raw. Built for ugly stage light and fast, consistent edits.",
		images: ["https://wouter.photo/20251017-2025-10-17_Kane-Ahoy_Wouter-Vellekoop__V1_8693_3x2.jpg"],
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
