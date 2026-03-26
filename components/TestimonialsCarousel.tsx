"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Testimonial = {
	quote: string;
	name: string;
	role: string;
};

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
	const [activeIndex, setActiveIndex] = React.useState(0);
	const totalItems = items.length;

	React.useEffect(() => {
		if (totalItems === 0) return;
		if (activeIndex < totalItems) return;
		setActiveIndex(0);
	}, [activeIndex, totalItems]);

	const goPrevious = React.useCallback(() => {
		if (totalItems <= 1) return;
		setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
	}, [totalItems]);

	const goNext = React.useCallback(() => {
		if (totalItems <= 1) return;
		setActiveIndex((prev) => (prev + 1) % totalItems);
	}, [totalItems]);

	if (totalItems === 0) return null;

	return (
		<div className="space-y-4">
			<div className="overflow-hidden">
				<div
					className="flex transition-transform duration-300 ease-out"
					style={{ transform: `translateX(-${activeIndex * 100}%)` }}
				>
					{items.map((item) => (
						<div key={item.name + item.quote} className="w-full shrink-0">
							<div className="rounded-2xl border border-border bg-card p-6">
								<p className="text-sm text-foreground">“{item.quote}”</p>
								<p className="mt-3 text-xs">
									<span className="font-medium text-foreground">{item.name}</span>
									<span className="text-muted-foreground"> — {item.role}</span>
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{totalItems > 1 ? (
				<div className="flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={goPrevious}
						aria-label="Previous testimonial"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={goNext}
						aria-label="Next testimonial"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			) : null}
		</div>
	);
}
