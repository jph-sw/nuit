import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import {
	createSession,
	generateSecureRandomString,
	validateSessionToken,
} from "../../utils/auth";
import { tokenFromRequest } from "../../utils/request";

const AuthBody = type({ username: "string", password: "string" });

interface UserRow {
	id: string;
	password_hash: string;
}

export const authSignUpRoute = {
	POST: async (req: BunRequest) => {
		const body = AuthBody(await req.json().catch(() => null));
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		const existing = db
			.query("SELECT id FROM user WHERE username = ?")
			.get(body.username);
		if (existing) {
			return new Response("Username already taken", { status: 409 });
		}

		const id = generateSecureRandomString();
		const passwordHash = await Bun.password.hash(body.password);

		db.run(
			"INSERT INTO user (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
			[id, body.username, passwordHash, Math.floor(Date.now() / 1000)],
		);

		const session = await createSession(id);
		return Response.json({ token: session.token }, { status: 201 });
	},
};

export const authSignInRoute = {
	POST: async (req: BunRequest) => {
		const body = AuthBody(await req.json().catch(() => null));
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		const user = db
			.query<UserRow, string>(
				"SELECT id, password_hash FROM user WHERE username = ?",
			)
			.get(body.username);

		if (!user) {
			return new Response("Invalid credentials", { status: 401 });
		}

		const valid = await Bun.password.verify(body.password, user.password_hash);
		if (!valid) {
			return new Response("Invalid credentials", { status: 401 });
		}

		const session = await createSession(user.id);
		return Response.json({ token: session.token }, { status: 200 });
	},
};

export const authSignOutRoute = {
	POST: async (req: BunRequest) => {
		const token = tokenFromRequest(req);
		if (!token) {
			return new Response("Unauthorized", { status: 401 });
		}

		const session = await validateSessionToken(token);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		db.run("DELETE FROM session WHERE id = ?", [session.id]);
		return new Response(null, { status: 204 });
	},
};

export const authMeRoute = {
	GET: async (req: BunRequest) => {
		const token = tokenFromRequest(req);
		if (!token) {
			return new Response("Unauthorized", { status: 401 });
		}

		const session = await validateSessionToken(token);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const user = db
			.query<{ id: string; username: string }, string>(
				"SELECT id, username FROM user WHERE id = ?",
			)
			.get(session.userId);

		return Response.json({ id: user?.id, username: user?.username });
	},
};
