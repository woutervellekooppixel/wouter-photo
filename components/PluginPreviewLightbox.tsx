"use client";

import { useState } from "react";
import Image from "next/image";

import { Lightbox } from "@/components/Lightbox";

type PluginPreviewLightboxProps = {
	src: string;
	alt: string;
	width: number;
	height: number;
	priority?: boolean;
};

export function PluginPreviewLightbox({
	src,
	alt,
	width,
	height,
	priority = false,
}: PluginPreviewLightboxProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				className="block w-full cursor-zoom-in"
				onClick={() => setOpen(true)}
				aria-label="Open image preview"
			>
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					priority={priority}
					className="h-auto w-full"
				/>
			</button>

			<Lightbox
				open={open}
				onOpenChange={setOpen}
				images={[{ src, alt }]}
				index={0}
				onIndexChange={() => {
					// single-image lightbox
				}}
				enableDownload={false}
			/>
		</>
	);
}
