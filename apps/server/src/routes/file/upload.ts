import { mkdir } from "node:fs/promises";
import { type } from "arktype";
import type { BunRequest } from "bun";
import mime from "mime-types";
import { db } from "../../db/db";
import { UPLOAD_DIR, getStoragePath } from "../../utils/storage";
import { authenticate } from "../../utils/request";

const UploadHeaders = type({
	"x-filename": "string > 0",
});

export const fileUploadRoute = {
	POST: async (req: BunRequest) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const headers = UploadHeaders({
			"x-filename": req.headers.get("x-filename"),
		});
		if (headers instanceof type.errors) {
			return Response.json({ error: headers.summary }, { status: 400 });
		}

		const folderId = req.headers.get("x-folder-id") ?? null;

		if (folderId !== null) {
			const folder = db.query("SELECT id FROM folders WHERE id = ?").get(folderId);
			if (!folder) {
				return Response.json({ error: "Folder not found" }, { status: 404 });
			}
		}

		const filename = headers["x-filename"].replace(/[^a-zA-Z0-9._-]/g, "_");
		const mimeType = mime.lookup(filename) || null;
		const id = Bun.randomUUIDv7();

		await mkdir(UPLOAD_DIR, { recursive: true });

		const writer = Bun.file(getStoragePath(id)).writer();
		for await (const chunk of req.body as AsyncIterable<Uint8Array>) {
			writer.write(chunk);
		}
		await writer.end();

		const fileSize = (await Bun.file(getStoragePath(id)).stat()).size;
		db.prepare(
			"INSERT INTO files (id, filename, size, mime_type, folder_id) VALUES (?1,?2,?3,?4,?5)",
		).run(id, filename, fileSize, mimeType, folderId);

		return Response.json({ filename }, { status: 201 });
	},
};
