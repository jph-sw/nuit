import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { UPLOAD_DIR, getFolderPath } from "../../utils/folder-path";
import { authenticate } from "../../utils/request";

const CreateBody = type({ name: "string > 0", parent_id: "string | null" });

export const folderCreateRoute = {
	POST: async (req: BunRequest) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const body = CreateBody(await req.json());
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		const id = Bun.randomUUIDv7();
		db.run("INSERT INTO folders (id, name, parent_id) VALUES (?, ?, ?)", [
			id,
			body.name,
			body.parent_id,
		]);

		const parentPath = body.parent_id ? getFolderPath(body.parent_id) : "";
		const dirPath = parentPath
			? join(UPLOAD_DIR, parentPath, body.name)
			: join(UPLOAD_DIR, body.name);
		await mkdir(dirPath, { recursive: true });

		const folder = db.query("SELECT * FROM folders WHERE id = ?").get(id);
		return Response.json(folder, { status: 201 });
	},
};
