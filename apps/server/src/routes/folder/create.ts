import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
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

		if (body.parent_id !== null) {
			const parent = db.query("SELECT id FROM folders WHERE id = ?").get(body.parent_id);
			if (!parent) {
				return Response.json({ error: "Parent folder not found" }, { status: 404 });
			}
		}

		const id = Bun.randomUUIDv7();
		db.run("INSERT INTO folders (id, name, parent_id) VALUES (?, ?, ?)", [
			id,
			body.name,
			body.parent_id,
		]);

		const folder = db.query("SELECT * FROM folders WHERE id = ?").get(id);
		return Response.json(folder, { status: 201 });
	},
};
