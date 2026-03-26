import { FileSchema } from "@nuit/types";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const FileArray = type(FileSchema.array());

export const filesRoute = {
	GET: async (req: BunRequest) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const url = new URL(req.url);
		const folderId = url.searchParams.get("folder_id");

		const rows =
			folderId === null
				? db.query("SELECT * FROM files WHERE folder_id IS NULL").all()
				: db.query("SELECT * FROM files WHERE folder_id = ?").all(folderId);

		const files = FileArray(rows);
		if (files instanceof type.errors) {
			return Response.json({ error: files.summary }, { status: 400 });
		}

		return Response.json(files);
	},
};
