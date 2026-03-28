import { FileTable } from "#/components/dashboard/file-table";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { filesQueryOptions, foldersQueryOptions } from "#/data/files-query-options";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ListViewIcon,
	FolderFileStorageIcon,
	FolderAddIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { FileExplorer } from "#/components/dashboard/file-explorer";
import { FileUploadDialog } from "#/components/dashboard/file-upload-dialog";
import { FolderCreateDialog } from "#/components/dashboard/folder-create-dialog";
import { FolderBreadcrumb } from "#/components/dashboard/folder-breadcrumb";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/_authed/files/")({
	validateSearch: (search) => ({
		folder: search.folder as string | undefined,
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const [viewType, setViewType] = useState("explorer");
	const [newFolderOpen, setNewFolderOpen] = useState(false);

	const { folder } = Route.useSearch();
	const currentFolderId = folder ?? null;
	const navigate = useNavigate({ from: Route.fullPath });

	const { data: files } = useQuery(filesQueryOptions(currentFolderId));
	const { data: folders } = useQuery(foldersQueryOptions(currentFolderId));

	const handleNavigate = (id: string | null) => {
		navigate({ search: { folder: id ?? undefined } });
	};

	return (
		<main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-8">
			<div className="mb-4 flex items-center justify-between">
				<FolderBreadcrumb currentFolderId={currentFolderId} onNavigate={handleNavigate} />
				<Tabs value={viewType} onValueChange={(e) => setViewType(e)}>
					<TabsList>
						<TabsTrigger value="explorer">
							<HugeiconsIcon icon={FolderFileStorageIcon} />
						</TabsTrigger>
						<TabsTrigger value="list">
							<HugeiconsIcon icon={ListViewIcon} />
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="mb-3 flex items-center gap-2">
				<FileUploadDialog folderId={currentFolderId} />
				<Button variant="outline" size="sm" onClick={() => setNewFolderOpen(true)}>
					<HugeiconsIcon icon={FolderAddIcon} />
					New folder
				</Button>
			</div>

			<div className="rounded-lg border">
				{files && folders ? (
					viewType === "explorer" ? (
						<FileExplorer
							files={files}
							folders={folders}
							onNavigate={(id) => handleNavigate(id)}
						/>
					) : (
						<FileTable files={files} />
					)
				) : (
					<div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
						Loading…
					</div>
				)}
			</div>

			<FolderCreateDialog
				parentId={currentFolderId}
				open={newFolderOpen}
				onOpenChange={setNewFolderOpen}
			/>
		</main>
	);
}
