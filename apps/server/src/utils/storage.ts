import { join } from "node:path";

export const UPLOAD_DIR = join(import.meta.dir, "../../../../data");

/**
 * Returns the absolute path where a file's bytes are stored on disk.
 * Files are stored flat as data/{id} — no folder structure mirrors the DB tree.
 */
export function getStoragePath(id: string): string {
	return join(UPLOAD_DIR, id);
}
