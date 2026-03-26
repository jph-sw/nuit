import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { type } from "arktype";
import type { BunRequest } from "bun";
import { db } from "../../db/db";
import { authenticate } from "../../utils/request";
import mime from "mime-types"

const UPLOAD_DIR = join(import.meta.dir, "../../../../../data");

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

		const baseName = headers["x-filename"].replace(/[^a-zA-Z0-9._-]/g, "_");
		const ext = baseName.includes(".") ? baseName.slice(baseName.lastIndexOf(".")) : "";
		const nameWithoutExt = ext ? baseName.slice(0, -ext.length) : baseName;

		await mkdir(UPLOAD_DIR, { recursive: true });

		let safeName = baseName;
		let counter = 2;
		while (await Bun.file(join(UPLOAD_DIR, safeName)).exists()) {
			safeName = `${nameWithoutExt}-${counter}${ext}`;
			counter++;
		}

		const mimeType = mime.lookup(safeName);

		const writer = Bun.file(join(UPLOAD_DIR, safeName)).writer();
		for await (const chunk of req.body as AsyncIterable<Uint8Array>) {
			writer.write(chunk);
		}
		await writer.end();


		const insertStatement = db.prepare(
			"INSERT INTO files (id, filename, size, mime_type) VALUES (?1,?2,?3,?4)",
		);

		const fileSize = (await Bun.file(join(UPLOAD_DIR, safeName)).stat()).size;
		insertStatement.run(Bun.randomUUIDv7(), safeName, fileSize, mimeType || null);

		return Response.json({ filename: safeName }, { status: 201 });
	},
};
