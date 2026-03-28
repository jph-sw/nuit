import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

export const folderDeleteRoute = {
	DELETE: async (req: BunRequest<"/api/folder/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;
		const exists = db.query("SELECT id FROM folders WHERE id = ?").get(id);
		if (!exists) {
			return new Response("Not Found", { status: 404 });
		}

		const { count: fileCount } = db
			.query<{ count: number }, string>(
				"SELECT COUNT(*) as count FROM files WHERE folder_id = ?",
			)
			.get(id)!;

		const { count: folderCount } = db
			.query<{ count: number }, string>(
				"SELECT COUNT(*) as count FROM folders WHERE parent_id = ?",
			)
			.get(id)!;

		if (fileCount > 0 || folderCount > 0) {
			return Response.json({ error: "Folder is not empty" }, { status: 409 });
		}

		db.run("DELETE FROM folders WHERE id = ?", [id]);

		return Response.json({});
	},
};
