import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import * as React from "react";
import { signInFn, signUpFn } from "../lib/auth";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		if (context.user) {
			throw redirect({ to: "/" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const router = useRouter();
	const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in");
	const [error, setError] = React.useState<string | null>(null);
	const [pending, setPending] = React.useState(false);

	const signIn = useServerFn(signInFn);
	const signUp = useServerFn(signUpFn);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		const form = new FormData(e.currentTarget);
		const username = form.get("username") as string;
		const password = form.get("password") as string;

		try {
			const result =
				mode === "sign-in"
					? await signIn({ data: { username, password } })
					: await signUp({ data: { username, password } });

			if (result?.error) {
				setError(result.error);
			} else {
				await router.invalidate();
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<main className="flex min-h-[calc(100svh-3rem)] flex-col items-center justify-center px-4">
			<div className="w-full max-w-sm">
				{/* Wordmark */}
				<p className="mb-8 text-center text-xl font-semibold tracking-tight font-display">
					nuit
				</p>

				<div className="rounded-xl border bg-card px-8 py-8 shadow-xs">
					<div className="mb-6">
						<h1 className="text-base font-semibold text-card-foreground">
							{mode === "sign-in" ? "Sign in" : "Create account"}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{mode === "sign-in"
								? "Welcome back."
								: "Get started with Nuit."}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<label className="flex flex-col gap-1.5">
							<span className="text-xs font-medium text-muted-foreground">
								Username
							</span>
							<Input
								name="username"
								type="text"
								required
								autoComplete="username"
								className="h-8"
							/>
						</label>

						<label className="flex flex-col gap-1.5">
							<span className="text-xs font-medium text-muted-foreground">
								Password
							</span>
							<Input
								name="password"
								type="password"
								required
								autoComplete={
									mode === "sign-in" ? "current-password" : "new-password"
								}
								className="h-8"
							/>
						</label>

						{error && (
							<p className="rounded-md bg-destructive/8 px-3 py-2 text-xs text-destructive">
								{error}
							</p>
						)}

						<Button type="submit" disabled={pending} size="sm" className="mt-1 w-full">
							{pending ? "…" : mode === "sign-in" ? "Sign in" : "Create account"}
						</Button>
					</form>
				</div>

				<p className="mt-4 text-center text-xs text-muted-foreground">
					{mode === "sign-in"
						? "Don't have an account?"
						: "Already have an account?"}{" "}
					<button
						type="button"
						className="font-medium text-foreground underline-offset-3 hover:underline"
						onClick={() => {
							setMode(mode === "sign-in" ? "sign-up" : "sign-in");
							setError(null);
						}}
					>
						{mode === "sign-in" ? "Sign up" : "Sign in"}
					</button>
				</p>
			</div>
		</main>
	);
}
