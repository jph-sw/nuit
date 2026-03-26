import { FolderSchema } from "@nuit/types";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const FolderArray = type(FolderSchema.array());

export const foldersRoute = {
	GET: async (req: BunRequest) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const url = new URL(req.url);
		const all = url.searchParams.get("all") === "true";
		const parentId = url.searchParams.get("parent_id");

		const rows = all
			? db.query("SELECT * FROM folders ORDER BY name").all()
			: parentId === null
				? db.query("SELECT * FROM folders WHERE parent_id IS NULL ORDER BY name").all()
				: db.query("SELECT * FROM folders WHERE parent_id = ? ORDER BY name").all(parentId);

		const folders = FolderArray(rows);
		if (folders instanceof type.errors) {
			return Response.json({ error: folders.summary }, { status: 400 });
		}

		return Response.json(folders);
	},
};
