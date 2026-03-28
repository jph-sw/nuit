import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const MoveBody = type({ folder_id: "string | null" });

export const fileMoveRoute = {
	PATCH: async (req: BunRequest<"/api/file/move/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;
		const file = db
			.query<{ filename: string; folder_id: string | null }, string>(
				"SELECT filename, folder_id FROM files WHERE id = ?",
			)
			.get(id);

		if (!file) {
			return new Response("Not Found", { status: 404 });
		}

		const body = MoveBody(await req.json());
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		if (body.folder_id !== null) {
			const folder = db.query("SELECT id FROM folders WHERE id = ?").get(body.folder_id);
			if (!folder) {
				return Response.json({ error: "Folder not found" }, { status: 404 });
			}
		}

		const conflict = db
			.query<{ id: string }, [string, string | null, string]>(
				"SELECT id FROM files WHERE filename = ? AND folder_id IS ? AND id != ?",
			)
			.get(file.filename, body.folder_id, id);

		if (conflict) {
			return Response.json(
				{ error: "A file with that name already exists in the destination folder" },
				{ status: 409 },
			);
		}

		db.run("UPDATE files SET folder_id = ? WHERE id = ?", [body.folder_id, id]);

		return Response.json({ folder_id: body.folder_id });
	},
};
