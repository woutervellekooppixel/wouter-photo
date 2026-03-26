"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";

export type PaddleEnvironment = "sandbox" | "live";

export interface PaddleCheckoutButtonProps {
	priceId: string;
	label: string;
	successUrl: string;
	environment?: PaddleEnvironment;
	className?: string;
}

declare global {
	interface Window {
		Paddle?: {
			Environment?: { set: (env: PaddleEnvironment) => void };
			Initialize: (config: { token: string }) => void;
			Checkout: {
				open: (config: {
					items?: Array<{ priceId: string; quantity?: number }>;
					settings?: { successUrl?: string; displayMode?: string };
					customData?: Record<string, unknown>;
				}) => void;
			};
		};
	}
}

export default function PaddleCheckoutButton({
	priceId,
	label,
	successUrl,
	environment,
	className,
}: PaddleCheckoutButtonProps) {
	const [scriptLoaded, setScriptLoaded] = useState(false);
	const initializedRef = useRef(false);

	const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

	const env: PaddleEnvironment = useMemo(() => {
		if (environment) return environment;
		const fromEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;
		return fromEnv === "sandbox" ? "sandbox" : "live";
	}, [environment]);

	useEffect(() => {
		if (!scriptLoaded) return;
		if (initializedRef.current) return;
		if (!clientToken) return;
		if (!window.Paddle) return;

		if (env === "sandbox") {
			window.Paddle.Environment?.set("sandbox");
		}

		window.Paddle.Initialize({ token: clientToken });
		initializedRef.current = true;
	}, [clientToken, env, scriptLoaded]);

	const ready = !!clientToken && scriptLoaded;

	return (
		<>
			<Script
				src="https://cdn.paddle.com/paddle/v2/paddle.js"
				strategy="afterInteractive"
				onLoad={() => setScriptLoaded(true)}
			/>
			<Button
				size="lg"
				className={className}
				disabled={!ready}
				onClick={() => {
					if (!window.Paddle) return;
					window.Paddle.Checkout.open({
						items: [{ priceId, quantity: 1 }],
						settings: { successUrl, displayMode: "overlay" },
						customData: {
							product: "stage-fix-v6",
						},
					});
				}}
			>
				{label}
			</Button>
		</>
	);
}
