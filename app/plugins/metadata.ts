import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Photoshop Plugins – Wouter.Photo",
	description:
		"Small Photoshop utilities by WouterPhoto that speed up repetitive workflows. Available on Adobe Exchange.",
	keywords: [
		"Photoshop plugins",
		"Adobe Exchange",
		"Photoshop utility",
		"Batch crop",
		"Slice tool",
		"WouterPhoto",
		"Wouter Vellekoop",
	],
	openGraph: {
		title: "Photoshop Plugins – WouterPhoto",
		description:
			"Small Photoshop utilities by WouterPhoto that speed up repetitive workflows. Available on Adobe Exchange.",
		url: "https://wouter.photo/plugins",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/batchcrop.png",
				width: 1360,
				height: 800,
				alt: "Photoshop plugin previews (BatchCrop)",
			},
		],
		locale: "nl_NL",
		alternateLocale: ["en_US"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Photoshop Plugins – WouterPhoto",
		description:
			"Small Photoshop utilities by WouterPhoto that speed up repetitive workflows. Available on Adobe Exchange.",
		images: ["https://wouter.photo/batchcrop.png"],
	},
	alternates: {
		canonical: "https://wouter.photo/plugins",
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
