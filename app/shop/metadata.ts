import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Shop – Wouter.Photo",
	description:
		"Presets en tools van Wouter Vellekoop. Stage Fix v6 (Lightroom/ACR) en Photoshop plugins.",
	keywords: [
		"Lightroom presets",
		"Adobe Camera Raw presets",
		"Preset system",
		"Stage Fix",
		"Photoshop plugins",
		"Wouter Vellekoop",
		"Wouter.Photo",
	],
	openGraph: {
		title: "Shop – Wouter.Photo",
		description:
			"Presets en tools van Wouter Vellekoop. Stage Fix v6 (Lightroom/ACR) en Photoshop plugins.",
		url: "https://wouter.photo/shop",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/batchcrop.png",
				width: 1360,
				height: 800,
				alt: "Shop – presets en tools",
			},
		],
		locale: "nl_NL",
		alternateLocale: ["en_US"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Shop – Wouter.Photo",
		description:
			"Presets en tools van Wouter Vellekoop. Stage Fix v6 (Lightroom/ACR) en Photoshop plugins.",
		images: ["https://wouter.photo/batchcrop.png"],
	},
	alternates: {
		canonical: "https://wouter.photo/shop",
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
