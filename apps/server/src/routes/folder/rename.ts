import { rename } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { UPLOAD_DIR, getFolderPath } from "../../utils/folder-path";
import { authenticate } from "../../utils/request";

const RenameBody = type({ name: "string > 0" });

export const folderRenameRoute = {
	PATCH: async (req: BunRequest<"/api/folder/rename/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;
		const existing = db
			.query<{ name: string; parent_id: string | null }, string>(
				"SELECT name, parent_id FROM folders WHERE id = ?",
			)
			.get(id);
		if (!existing) {
			return new Response("Not Found", { status: 404 });
		}

		const body = RenameBody(await req.json());
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		// Compute old path before updating DB
		const oldPath = join(UPLOAD_DIR, getFolderPath(id));

		db.run("UPDATE folders SET name = ? WHERE id = ?", [body.name, id]);

		// Compute new path after update
		const newPath = join(UPLOAD_DIR, getFolderPath(id));

		await rename(oldPath, newPath);

		const folder = db.query("SELECT * FROM folders WHERE id = ?").get(id);
		return Response.json(folder);
	},
};
