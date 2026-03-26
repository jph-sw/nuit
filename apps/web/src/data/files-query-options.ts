import { queryOptions } from "@tanstack/react-query";
import { getFilesFn } from "./files-actions";

export const filesQueryOptions = queryOptions({
	queryKey: ["files"],
	queryFn: async () => getFilesFn(),
});
