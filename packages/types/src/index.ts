import { type } from "arktype";

export const FileSchema = type({
	id: "string",
	filename: "string",
	size: "number",
	mime_type: "string | null",
	folder_id: "string | null",
	created_at: "string",
});

export type File = typeof FileSchema.infer;

export const FolderSchema = type({
	id: "string",
	name: "string",
	parent_id: "string | null",
	created_at: "string",
});

export type Folder = typeof FolderSchema.infer;
