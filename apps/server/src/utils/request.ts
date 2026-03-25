import type { BunRequest } from "bun";
import { validateSessionToken } from "./auth";
import type { Session } from "./types";

export function tokenFromRequest(req: BunRequest): string | null {
	const auth = req.headers.get("authorization");
	if (!auth?.startsWith("Bearer ")) return null;
	return auth.slice(7);
}

export async function authenticate(req: BunRequest): Promise<Session | null> {
	const token = tokenFromRequest(req);
	if (!token) return null;
	return validateSessionToken(token);
}
