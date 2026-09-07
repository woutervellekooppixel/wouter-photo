import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Shop",
	description:
		"Presets and tools by Wouter Vellekoop: Stage Fix v6 for Lightroom and Adobe Camera Raw, plus Photoshop plugins.",
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
			"Presets and tools by Wouter Vellekoop: Stage Fix v6 for Lightroom and Adobe Camera Raw, plus Photoshop plugins.",
		url: "https://www.wouter.photo/shop",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://www.wouter.photo/batchcrop.png",
				width: 1360,
				height: 800,
				alt: "Shop – presets and tools",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Shop – Wouter.Photo",
		description:
			"Presets and tools by Wouter Vellekoop: Stage Fix v6 for Lightroom and Adobe Camera Raw, plus Photoshop plugins.",
		images: ["https://www.wouter.photo/batchcrop.png"],
	},
	alternates: {
		canonical: "https://www.wouter.photo/shop",
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
