"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StatItem = {
	value: number;
	label: string;
	valueSuffix?: string;
};

type AnimatedStatsGridProps = {
	stats: StatItem[];
};

function CountUpNumber({ value, suffix = "", start }: { value: number; suffix?: string; start: boolean }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		if (!start) return;

		const duration = 1200;
		const startTime = performance.now();
		let frameId = 0;

		const tick = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setDisplayValue(Math.round(value * eased));

			if (progress < 1) {
				frameId = window.requestAnimationFrame(tick);
			}
		};

		frameId = window.requestAnimationFrame(tick);

		return () => window.cancelAnimationFrame(frameId);
	}, [start, value]);

	return (
		<span>
			{displayValue}
			{suffix}
		</span>
	);
}

export default function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [hasStarted, setHasStarted] = useState(false);

	useEffect(() => {
		const element = containerRef.current;
		if (!element || hasStarted) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setHasStarted(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.35 },
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [hasStarted]);

	const normalizedStats = useMemo(
		() => stats.map((stat) => ({ ...stat, valueSuffix: stat.valueSuffix ?? "" })),
		[stats],
	);

	return (
		<div ref={containerRef} className="grid grid-cols-2 gap-3">
			{normalizedStats.map((stat) => (
				<div
					key={stat.label}
					className="flex min-h-28 flex-col justify-between rounded-2xl border border-border bg-background px-4 py-4 text-center sm:text-left"
				>
					<p className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
						<CountUpNumber value={stat.value} suffix={stat.valueSuffix} start={hasStarted} />
					</p>
					<p className="mt-2 text-sm leading-snug text-muted-foreground">{stat.label}</p>
				</div>
			))}
		</div>
	);
}