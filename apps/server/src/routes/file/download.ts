import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { getStoragePath } from "../../utils/storage";
import { authenticate } from "../../utils/request";

export const fileDownloadRoute = {
	GET: async (req: BunRequest<"/api/file/download/:id">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const row = db
			.query<{ filename: string }, string>(
				"SELECT filename FROM files WHERE id = ?",
			)
			.get(req.params.id);

		if (!row) {
			return new Response("Not Found", { status: 404 });
		}

		const file = Bun.file(getStoragePath(req.params.id));

		if (!(await file.exists())) {
			return new Response("Not Found", { status: 404 });
		}

		return new Response(file, {
			headers: {
				"Content-Disposition": `attachment; filename="${row.filename}"`,
				"Content-Type": file.type,
			},
		});
	},
};
