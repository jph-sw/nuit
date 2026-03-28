import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const RenameBody = type({ filename: "string > 0" });

export const fileRenameRoute = {
	PATCH: async (req: BunRequest<"/api/file/rename/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;
		const row = db
			.query<{ filename: string; folder_id: string | null }, string>(
				"SELECT filename, folder_id FROM files WHERE id = ?",
			)
			.get(id);

		if (!row) {
			return new Response("Not Found", { status: 404 });
		}

		const body = RenameBody(await req.json());
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");

		// IS is NULL-safe: matches folder_id = ? when non-null, or folder_id IS NULL when null
		const conflict = db
			.query<{ id: string }, [string, string | null, string]>(
				"SELECT id FROM files WHERE filename = ? AND folder_id IS ? AND id != ?",
			)
			.get(safeName, row.folder_id, id);

		if (conflict) {
			return Response.json(
				{ error: "A file with that name already exists in this folder" },
				{ status: 409 },
			);
		}

		db.run("UPDATE files SET filename = ? WHERE id = ?", [safeName, id]);

		return Response.json({ filename: safeName });
	},
};
