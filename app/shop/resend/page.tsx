"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const PRODUCTS = [
	{ value: "stage-fix-v6", label: "Stage Fix v6 — Lightroom Preset System" },
];

export default function ResendPage() {
	const [email, setEmail] = useState("");
	const [product, setProduct] = useState("stage-fix-v6");
	const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("loading");
		try {
			const res = await fetch("/api/presets/resend", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, product }),
			});
			setStatus(res.ok ? "done" : "error");
		} catch {
			setStatus("error");
		}
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto w-full max-w-2xl px-6 py-20">
				<div className="space-y-6 rounded-3xl border border-border bg-card p-8 sm:p-10">

					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">Re-send download link</h1>
						<p className="text-sm text-muted-foreground">
							Enter the email address you used at checkout. If we have a recent purchase on file,
							we'll send the download link again.
						</p>
					</div>

					{status === "done" ? (
						<div className="space-y-3">
							<div className="rounded-2xl border border-border bg-background/70 px-5 py-4">
								<p className="text-sm font-medium">Email sent — check your inbox.</p>
								<p className="text-xs text-muted-foreground mt-1">
									Also check your spam or promotions folder if you don't see it within a few minutes.
								</p>
							</div>
							<p className="text-sm text-muted-foreground">
								Still not getting it?{" "}
								<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
									hello@wouter.photo
								</a>
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<label htmlFor="email" className="text-sm font-medium">
									Purchase email
								</label>
								<input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>

							{PRODUCTS.length > 1 && (
								<div className="space-y-1.5">
									<label htmlFor="product" className="text-sm font-medium">
										Product
									</label>
									<select
										id="product"
										value={product}
										onChange={(e) => setProduct(e.target.value)}
										className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
									>
										{PRODUCTS.map((p) => (
											<option key={p.value} value={p.value}>
												{p.label}
											</option>
										))}
									</select>
								</div>
							)}

							{status === "error" && (
								<p className="text-sm text-destructive">
									Something went wrong. Email{" "}
									<a href="mailto:hello@wouter.photo" className="underline underline-offset-4">
										hello@wouter.photo
									</a>{" "}
									directly.
								</p>
							)}

							<Button type="submit" size="lg" disabled={status === "loading"}>
								{status === "loading" ? "Sending…" : "Send download link"}
							</Button>
						</form>
					)}

					<div className="border-t border-border pt-4">
						<p className="text-xs text-muted-foreground">
							Not a customer yet?{" "}
							<Link href="/shop" className="underline underline-offset-4">
								Go to the shop.
							</Link>
						</p>
					</div>

				</div>
			</div>
		</main>
	);
}
