import { type } from "arktype";

export const FileSchema = type({
	id: "string",
	filename: "string",
	size: "number",
	mime_type: "string | null",
	created_at: "string",
});

export type File = typeof FileSchema.infer;
