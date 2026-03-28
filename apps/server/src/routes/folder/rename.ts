import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
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

		db.run("UPDATE folders SET name = ? WHERE id = ?", [body.name, id]);

		const folder = db.query("SELECT * FROM folders WHERE id = ?").get(id);
		return Response.json(folder);
	},
};
