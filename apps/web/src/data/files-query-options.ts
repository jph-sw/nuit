import { queryOptions } from "@tanstack/react-query";
import { getFilesFn, getFolderAncestorsFn, getFoldersFn } from "./files-actions";

export const filesQueryOptions = (folderId: string | null) =>
	queryOptions({
		queryKey: ["files", folderId],
		queryFn: () => getFilesFn({ data: { folder_id: folderId } }),
	});

export const foldersQueryOptions = (parentId: string | null) =>
	queryOptions({
		queryKey: ["folders", parentId],
		queryFn: () => getFoldersFn({ data: { parent_id: parentId } }),
	});

export const allFoldersQueryOptions = queryOptions({
	queryKey: ["folders", "all"],
	queryFn: () => getFoldersFn({ data: { parent_id: null, all: true } }),
});

export const folderAncestorsQueryOptions = (folderId: string) =>
	queryOptions({
		queryKey: ["folder-ancestors", folderId],
		queryFn: () => getFolderAncestorsFn({ data: { id: folderId } }),
	});
