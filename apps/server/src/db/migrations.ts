import { Log } from "../utils/log";
import { db } from "./db";

const logger = new Log();

const migrations: string[] = [
	`CREATE TABLE IF NOT EXISTS files (
		id TEXT NOT NULL PRIMARY KEY,
		filename TEXT NOT NULL,
		size INTEGER NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS session (
		id TEXT NOT NULL PRIMARY KEY,
		secret_hash BLOB NOT NULL,
		created_at INTEGER NOT NULL
	) STRICT`,
	`CREATE TABLE IF NOT EXISTS user (
		id TEXT NOT NULL PRIMARY KEY,
		username TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		created_at INTEGER NOT NULL
	) STRICT`,
  `ALTER TABLE session ADD COLUMN user_id TEXT REFERENCES user(id)`,
	`ALTER TABLE files ADD COLUMN mime_type TEXT`,
	`CREATE TABLE IF NOT EXISTS folders (
		id TEXT NOT NULL PRIMARY KEY,
		name TEXT NOT NULL,
		parent_id TEXT REFERENCES folders(id),
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`ALTER TABLE files ADD COLUMN folder_id TEXT REFERENCES folders(id)`,
];

export function migrate() {
	db.run(`CREATE TABLE IF NOT EXISTS _migrations (
		id INTEGER PRIMARY KEY,
		applied_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`);

	// biome-ignore lint/style/noNonNullAssertion: <>
	const { count } = db
		.query<{ count: number }, []>("SELECT COUNT(*) as count FROM _migrations")
		.get()!;

	db.transaction(() => {
		for (let i = count; i < migrations.length; i++) {
			// biome-ignore lint/style/noNonNullAssertion: <>
			db.run(migrations[i]!);
			db.run("INSERT INTO _migrations (id) VALUES (?)", [i]);
		}
	})();

	logger.info("Migration complete");
}
