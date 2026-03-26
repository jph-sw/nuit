import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

export const folderAncestorsRoute = {
	GET: async (req: BunRequest<"/api/folder/:id/ancestors">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;

		// Returns chain from root down to (and including) the target folder
		const rows = db
			.query<{ id: string; name: string; parent_id: string | null }, string>(
				`WITH RECURSIVE chain AS (
					SELECT id, name, parent_id, 0 AS depth FROM folders WHERE id = ?
					UNION ALL
					SELECT f.id, f.name, f.parent_id, c.depth + 1 FROM folders f
					JOIN chain c ON f.id = c.parent_id
				)
				SELECT id, name, parent_id FROM chain ORDER BY depth DESC`,
			)
			.all(id);

		return Response.json(rows);
	},
};
