import { api } from "#/lib/api";
import type { File } from "@nuit/types";
import { createServerFn } from "@tanstack/react-start";

export const getFilesFn = createServerFn({ method: "GET" }).handler(() =>
	api<File[]>("/api/files"),
);
