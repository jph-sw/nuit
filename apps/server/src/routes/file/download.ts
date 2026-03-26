import { join } from "node:path";
import type { BunRequest } from "bun";
import { authenticate } from "../../utils/request";

const UPLOAD_DIR = join(import.meta.dir, "../../../../../data");

export const fileDownloadRoute = {
	GET: async (req: BunRequest<"/api/file/download/:filename">) => {
		const session = await authenticate(req);
		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { filename } = req.params;
		const file = Bun.file(join(UPLOAD_DIR, filename));

		if (!(await file.exists())) {
			return new Response("Not Found", { status: 404 });
		}

		return new Response(file, {
			headers: {
				"Content-Disposition": `attachment; filename="${filename}"`,
				"Content-Type": file.type,
			},
		});
	},
};
