import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const File = type({
	id: "string",
	filename: "string",
	size: "string",
	created_at: "string",
});

const FileArray = type(File.array());

export const filesRoute = {
	GET: async (req: BunRequest) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const files = FileArray(db.query("SELECT * FROM files").all());

		if (files instanceof type.errors) {
			return Response.json({ error: files.summary }, { status: 400 });
		}

		return Response.json({ files });
	},
};
