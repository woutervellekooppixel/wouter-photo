import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "BatchCrop – Crop Multiple Photos (Batch) in Photoshop – Wouter.Photo",
	description:
		"Batch crop (bulk crop) photos in Photoshop. Set a crop once and apply it consistently across a whole folder or large photo set — fast and repeatable.",
	keywords: [
		"Batch crop",
		"Photoshop batch crop",
		"Crop multiple images",
		"Crop multiple photos",
		"Bulk crop photos",
		"Crop a folder of images",
		"Photoshop bulk crop",
		"Photoshop plugin",
		"Adobe Exchange",
		"Photography workflow",
		"WouterPhoto",
	],
	openGraph: {
		title: "BatchCrop – Crop Multiple Photos (Batch) in Photoshop",
		description:
			"Batch crop (bulk crop) photos in Photoshop. Set a crop once and apply it consistently across a whole folder or large photo set.",
		url: "https://wouter.photo/plugins/batchcrop",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/batchcrop.png",
				width: 1360,
				height: 800,
				alt: "BatchCrop Photoshop plugin preview (batch crop multiple photos)",
			},
		],
		locale: "nl_NL",
		alternateLocale: ["en_US"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "BatchCrop – Crop Multiple Photos (Batch) in Photoshop",
		description:
			"Batch crop (bulk crop) photos in Photoshop. Set a crop once and apply it consistently across a whole folder or large photo set.",
		images: ["https://wouter.photo/batchcrop.png"],
	},
	alternates: {
		canonical: "https://wouter.photo/plugins/batchcrop",
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
