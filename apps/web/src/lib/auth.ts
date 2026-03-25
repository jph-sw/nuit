import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	clearSession,
	getSession,
	updateSession,
} from "@tanstack/react-start/server";

const API_URL = process.env["API_URL"] ?? "http://localhost:3001";

type SessionData = { token: string };

const sessionConfig = {
	password: process.env["SESSION_SECRET"] ?? "changeme-use-a-32-char-secret!!",
};

export type AuthUser = { id: string; username: string };

export const fetchUserFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const session = await getSession<SessionData>(sessionConfig);
		if (!session.data.token) return null;

		const res = await fetch(`${API_URL}/api/auth/me`, {
			headers: { Authorization: `Bearer ${session.data.token}` },
		});

		if (!res.ok) {
			await clearSession(sessionConfig);
			return null;
		}

		return res.json();
	},
);

export const signInFn = createServerFn({ method: "POST" })
	.inputValidator(
		(d: { username: string; password: string; redirectTo?: string }) => d,
	)
	.handler(async ({ data }) => {
		const res = await fetch(`${API_URL}/api/auth/sign-in`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: data.username,
				password: data.password,
			}),
		});

		if (!res.ok) {
			return {
				error:
					((await res.json()) as { error: string }).error ?? (await res.text()),
			};
		}

		const { token } = (await res.json()) as { token: string };
		await updateSession<SessionData>(sessionConfig, { token });

		throw redirect({ href: data.redirectTo ?? "/" });
	});

export const signUpFn = createServerFn({ method: "POST" })
	.inputValidator((d: { username: string; password: string }) => d)
	.handler(async ({ data }) => {
		const res = await fetch(`${API_URL}/api/auth/sign-up`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: data.username,
				password: data.password,
			}),
		});

		if (!res.ok) {
			return {
				error:
					((await res.json()) as { error: string }).error ?? (await res.text()),
			};
		}

		const { token } = (await res.json()) as { token: string };
		await updateSession<SessionData>(sessionConfig, { token });

		throw redirect({ href: "/" });
	});

export const signOutFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await getSession<SessionData>(sessionConfig);

		if (session.data.token) {
			await fetch(`${API_URL}/api/auth/sign-out`, {
				method: "POST",
				headers: { Authorization: `Bearer ${session.data.token}` },
			}).catch(() => {});
		}

		await clearSession(sessionConfig);
		throw redirect({ href: "/login" });
	},
);
