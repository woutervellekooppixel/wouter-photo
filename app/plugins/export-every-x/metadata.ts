import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Export Every X – Photoshop Slices & Carousel Export – Wouter.Photo",
	description:
		"Export (slice) huge wide Photoshop documents into panels every X pixels (e.g. 1080px). Perfect for Instagram carousel exports, banners, and panoramic layouts.",
	keywords: [
		"Export every X",
		"Crop every X",
		"Photoshop export",
		"Photoshop slices",
		"Export slices",
		"Instagram carousel",
		"Instagram carousel 1080",
		"Carousel panels",
		"Panoramic layout",
		"Web banners",
		"Grid design",
		"Photoshop plugin",
		"Adobe Exchange",
		"Canvas export",
		"WouterPhoto",
	],
	openGraph: {
		title: "Export Every X – Photoshop Slices & Carousel Export",
		description:
			"Export (slice) huge wide Photoshop documents into panels every X pixels (e.g. 1080px) for Instagram carousels, banners, and panoramic layouts.",
		url: "https://wouter.photo/plugins/export-every-x",
		siteName: "Wouter.Photo",
		images: [
			{
				url: "https://wouter.photo/cropevery.png",
				width: 2990,
				height: 1766,
				alt: "Export Every X Photoshop plugin preview (export 1080px carousel slices)",
			},
		],
		locale: "nl_NL",
		alternateLocale: ["en_US"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Export Every X – Photoshop Slices & Carousel Export",
		description:
			"Export (slice) huge wide Photoshop documents into panels every X pixels (e.g. 1080px) for Instagram carousels, banners, and panoramic layouts.",
		images: ["https://wouter.photo/cropevery.png"],
	},
	alternates: {
		canonical: "https://wouter.photo/plugins/export-every-x",
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
