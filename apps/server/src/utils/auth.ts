import { db } from "../db/db";
import type { Session, SessionWithToken } from "./types";

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		// biome-ignore lint/style/noNonNullAssertion: <>
		c |= a[i]! ^ b[i]!;
	}
	return c === 0;
}

export function generateSecureRandomString(): string {
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = "";
	for (let i = 0; i < bytes.length; i++) {
		// biome-ignore lint/style/noNonNullAssertion: <>
		id += alphabet[bytes[i]! >> 3]!;
	}
	return id;
}

export async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
	return new Uint8Array(secretHashBuffer);
}

export async function createSession(userId: string): Promise<SessionWithToken> {
	const now = new Date();

	const id = generateSecureRandomString();
	const secret = generateSecureRandomString();
	const secretHash = await hashSecret(secret);

	const token = `${id}.${secret}`;

	const session: SessionWithToken = {
		id,
		userId,
		secretHash,
		createdAt: now,
		token,
	};

	const insertStatement = db.prepare(
		"INSERT INTO session (id, secret_hash, created_at, user_id) VALUES (?1, ?2, ?3, ?4)",
	);

	insertStatement.run(
		session.id,
		session.secretHash,
		Math.floor(session.createdAt.getTime() / 1000),
		userId,
	);

	return session;
}

export async function validateSessionToken(
	token: string,
): Promise<Session | null> {
	const tokenParts = token.split(".");
	if (tokenParts.length !== 2) {
		return null;
	}
	// biome-ignore lint/style/noNonNullAssertion: <>
	const sessionId: string = tokenParts[0]!;
	// biome-ignore lint/style/noNonNullAssertion: <>
	const sessionSecret: string = tokenParts[1]!;

	const session = await getSession(sessionId);
	if (!session) {
		return null;
	}

	const tokenSecretHash = await hashSecret(sessionSecret);
	const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
	if (!validSecret) {
		return null;
	}

	return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
	const now = new Date();

	const row = db
		.query<
			{
				id: string;
				secret_hash: Uint8Array;
				created_at: number;
				user_id: string;
			},
			string
		>("SELECT id, secret_hash, created_at, user_id FROM session WHERE id = ?1")
		.get(sessionId);

	if (!row) {
		return null;
	}

	const session: Session = {
		id: row.id,
		userId: row.user_id,
		secretHash: row.secret_hash,
		createdAt: new Date(row.created_at * 1000),
	};

	if (
		now.getTime() - session.createdAt.getTime() >=
		sessionExpiresInSeconds * 1000
	) {
		deleteSession(sessionId);
		return null;
	}

	return session;
}

function deleteSession(sessionId: string) {
	db.run("DELETE FROM session WHERE id = ?", [sessionId]);
}
