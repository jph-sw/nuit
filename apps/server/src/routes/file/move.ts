import { rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { UPLOAD_DIR, getFolderPath } from "../../utils/folder-path";
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

		const oldFolderPath = file.folder_id ? getFolderPath(file.folder_id) : "";
		const newFolderPath = body.folder_id ? getFolderPath(body.folder_id) : "";

		const oldPath = oldFolderPath
			? join(UPLOAD_DIR, oldFolderPath, file.filename)
			: join(UPLOAD_DIR, file.filename);
		const newDir = newFolderPath ? join(UPLOAD_DIR, newFolderPath) : UPLOAD_DIR;
		const newPath = join(newDir, file.filename);

		await mkdir(newDir, { recursive: true });
		await rename(oldPath, newPath);

		db.run("UPDATE files SET folder_id = ? WHERE id = ?", [body.folder_id, id]);
		return Response.json({ folder_id: body.folder_id });
	},
};
