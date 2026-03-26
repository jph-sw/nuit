import { api, apiBlob } from "#/lib/api";
import type { File, Folder } from "@nuit/types";
import { createServerFn } from "@tanstack/react-start";

export const getFilesFn = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => d as { folder_id: string | null })
	.handler(({ data }) => {
		const qs = data.folder_id ? `?folder_id=${data.folder_id}` : "";
		return api<File[]>(`/api/files${qs}`);
	});

export const downloadFileFn = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => d as { id: string })
	.handler(({ data }) => apiBlob(`/api/file/download/${data.id}`));

export const renameFileFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { id: string; filename: string })
	.handler(({ data }) =>
		api<{ filename: string }>(`/api/file/rename/${data.id}`, {
			method: "PATCH",
			body: JSON.stringify({ filename: data.filename }),
			headers: { "Content-Type": "application/json" },
		}),
	);

export const moveFileFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { id: string; folder_id: string | null })
	.handler(({ data }) =>
		api<{ folder_id: string | null }>(`/api/file/move/${data.id}`, {
			method: "PATCH",
			body: JSON.stringify({ folder_id: data.folder_id }),
			headers: { "Content-Type": "application/json" },
		}),
	);

export const uploadFileFn = createServerFn({ method: "POST" })
	.inputValidator(
		(d: unknown) => d as { filename: string; base64: string; folder_id: string | null },
	)
	.handler(({ data }) =>
		api<{ filename: string }>("/api/file/upload", {
			method: "POST",
			body: Buffer.from(data.base64, "base64"),
			headers: {
				"x-filename": data.filename,
				...(data.folder_id ? { "x-folder-id": data.folder_id } : {}),
			},
		}),
	);

export const getFoldersFn = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => d as { parent_id: string | null; all?: boolean })
	.handler(({ data }) => {
		if (data.all) return api<Folder[]>("/api/folders?all=true");
		const qs = data.parent_id ? `?parent_id=${data.parent_id}` : "";
		return api<Folder[]>(`/api/folders${qs}`);
	});

export const getFolderAncestorsFn = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => d as { id: string })
	.handler(({ data }) =>
		api<{ id: string; name: string; parent_id: string | null }[]>(
			`/api/folder/${data.id}/ancestors`,
		),
	);

export const createFolderFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { name: string; parent_id: string | null })
	.handler(({ data }) =>
		api<Folder>("/api/folder", {
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" },
		}),
	);

export const renameFolderFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { id: string; name: string })
	.handler(({ data }) =>
		api<Folder>(`/api/folder/rename/${data.id}`, {
			method: "PATCH",
			body: JSON.stringify({ name: data.name }),
			headers: { "Content-Type": "application/json" },
		}),
	);

export const deleteFolderFn = createServerFn({ method: "POST" })
	.inputValidator((d: unknown) => d as { id: string })
	.handler(({ data }) => api<Record<string, never>>(`/api/folder/${data.id}`, { method: "DELETE" }));
