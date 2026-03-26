import { join } from "node:path";
import { db } from "../db/db";

export const UPLOAD_DIR = join(import.meta.dir, "../../../../data");

/**
 * Resolves the filesystem path for a folder using a recursive CTE.
 * Returns a relative path like "FolderA/SubFolder", or "" for root (null id).
 */
export function getFolderPath(folderId: string | null): string {
	if (folderId === null) return "";

	const rows = db
		.query<{ name: string }, string>(
			`WITH RECURSIVE chain AS (
				SELECT id, name, parent_id, 0 AS depth FROM folders WHERE id = ?
				UNION ALL
				SELECT f.id, f.name, f.parent_id, c.depth + 1 FROM folders f
				JOIN chain c ON f.id = c.parent_id
			)
			SELECT name FROM chain ORDER BY depth DESC`,
		)
		.all(folderId);

	return rows.map((r) => r.name).join("/");
}

/**
 * Returns the full absolute path for a file given its folder.
 */
export function getFilePath(folderId: string | null, filename: string): string {
	const folderPath = getFolderPath(folderId);
	return folderPath ? join(UPLOAD_DIR, folderPath, filename) : join(UPLOAD_DIR, filename);
}
