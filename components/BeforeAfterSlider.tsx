"use client";

import { useId, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type BeforeAfterSliderProps = {
	beforeSrc: string;
	afterSrc: string;
	beforeAlt: string;
	afterAlt: string;
	className?: string;
	imageClassName?: string;
	priority?: boolean;
	sizes?: string;
	beforeLabel?: string;
	afterLabel?: string;
	initialPosition?: number;
	hint?: string;
};

export default function BeforeAfterSlider({
	beforeSrc,
	afterSrc,
	beforeAlt,
	afterAlt,
	className,
	imageClassName,
	priority = false,
	sizes,
	beforeLabel = "Before",
	afterLabel = "After",
	initialPosition = 50,
	hint = "Drag the handle to compare the original frame with the Stage Fix edit.",
}: BeforeAfterSliderProps) {
	const sliderId = useId();
	const [position, setPosition] = useState(initialPosition);

	return (
		<div className={cn("space-y-3", className)}>
			<div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
				<div className={cn("relative aspect-[3/2] select-none", imageClassName)}>
					<Image
						src={beforeSrc}
						alt={beforeAlt}
						fill
						priority={priority}
						sizes={sizes}
						className="object-cover"
						draggable={false}
					/>
					<div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
						<Image
							src={afterSrc}
							alt={afterAlt}
							fill
							priority={priority}
							sizes={sizes}
							className="object-cover"
							draggable={false}
						/>
					</div>

					<div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:left-4 sm:top-4">
						{beforeLabel}
					</div>
					<div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:right-4 sm:top-4">
						{afterLabel}
					</div>

					<div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
						<div className="relative h-full w-px bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]">
							<div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 text-base font-semibold text-white shadow-lg backdrop-blur-sm">
								<>
									<span aria-hidden="true">&lt;</span>
									<span aria-hidden="true" className="mx-1 opacity-70">|</span>
									<span aria-hidden="true">&gt;</span>
								</>
							</div>
						</div>
					</div>

					<label htmlFor={sliderId} className="sr-only">
						Drag to compare before and after images
					</label>
					<input
						id={sliderId}
						type="range"
						min={0}
						max={100}
						value={position}
						onChange={(event) => setPosition(Number(event.target.value))}
						className="absolute inset-0 z-10 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={position}
						aria-label="Before and after image comparison"
					/>
				</div>
			</div>
			{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
		</div>
	);
}