import { api, apiBlob } from "#/lib/api";
import type { File } from "@nuit/types";
import { createServerFn } from "@tanstack/react-start";

export const getFilesFn = createServerFn({ method: "GET" }).handler(() =>
	api<File[]>("/api/files"),
);

export const downloadFileFn = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => d as { filename: string })
	.handler(({ data }) =>
		apiBlob(`/api/file/download/${encodeURIComponent(data.filename)}`),
	);

export const uploadFileFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { filename: string; base64: string })
	.handler(({ data }) =>
		api<{ filename: string }>("/api/file/upload", {
			method: "POST",
			body: Buffer.from(data.base64, "base64"),
			headers: { "x-filename": data.filename },
		}),
	);
