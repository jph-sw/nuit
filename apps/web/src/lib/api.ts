import { getSession } from "@tanstack/react-start/server";

const API_URL = process.env["API_URL"] ?? "http://localhost:3001";

const sessionConfig = {
	password: process.env["SESSION_SECRET"] ?? "changeme-use-a-32-char-secret!!",
};

type SessionData = { token: string };

export async function api<T = unknown>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
  console.log("Starting Request")
	const session = await getSession<SessionData>(sessionConfig);

 console.log("Got Session", session.id)


	const res = await fetch(`${API_URL}${path}`, {
		...init,
		headers: {
			...init.headers,
			Authorization: `Bearer ${session.data.token}`,
		},
	});

	console.log("finished request")

  if (!res.ok) {
    const json = await res.json()
    console.log(`${init.method ?? "GET"} ${path} failed: ${res.statusText} ${JSON.stringify(json)}`)
		throw new Error(
			`${init.method ?? "GET"} ${path} failed: ${res.statusText}`,
		);
  }

	return res.json();
}
