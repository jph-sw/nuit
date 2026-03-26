import { rename } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";

const UPLOAD_DIR = join(import.meta.dir, "../../../../../data");

const RenameBody = type({ filename: "string > 0" });

export const fileRenameRoute = {
	PATCH: async (req: BunRequest<"/api/file/rename/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { id } = req.params;
		const row = db
			.query<{ filename: string }, string>("SELECT filename FROM files WHERE id = ?")
			.get(id);

		if (!row) {
			return new Response("Not Found", { status: 404 });
		}

		const body = RenameBody(await req.json());
		if (body instanceof type.errors) {
			return Response.json({ error: body.summary }, { status: 400 });
		}

		const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");

		if (await Bun.file(join(UPLOAD_DIR, safeName)).exists()) {
			return Response.json({ error: "A file with that name already exists" }, { status: 409 });
		}

		await rename(join(UPLOAD_DIR, row.filename), join(UPLOAD_DIR, safeName));
		db.run("UPDATE files SET filename = ? WHERE id = ?", [safeName, id]);

		return Response.json({ filename: safeName });
	},
};
