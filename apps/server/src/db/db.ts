import { Database } from "bun:sqlite";
import { join } from "node:path";

const DB_DIR = join(import.meta.dir, "../../../../data");

export const db = new Database(`${DB_DIR}/database.sqlite`);
