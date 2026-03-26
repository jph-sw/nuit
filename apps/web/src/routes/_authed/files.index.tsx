import { FileTable } from "#/components/dashboard/file-table";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
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
		<main className="page-wrap px-4 pb-8 pt-14 flex justify-center">
			<div className="w-6xl">
				<FolderBreadcrumb currentFolderId={currentFolderId} onNavigate={handleNavigate} />
				<Card>
					<CardHeader>
						<div className="flex w-full justify-between items-center">
							<div className="flex gap-2">
								<FileUploadDialog folderId={currentFolderId} />
								<Button variant="outline" onClick={() => setNewFolderOpen(true)}>
									<HugeiconsIcon icon={FolderAddIcon} />
									New folder
								</Button>
							</div>
							<Tabs value={viewType} onValueChange={(e) => setViewType(e)}>
								<TabsList>
									<TabsTrigger value={"explorer"}>
										<HugeiconsIcon icon={FolderFileStorageIcon} />
									</TabsTrigger>
									<TabsTrigger value={"list"}>
										<HugeiconsIcon icon={ListViewIcon} />
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</CardHeader>
					<CardContent>
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
							"Loading"
						)}
					</CardContent>
				</Card>
			</div>
			<FolderCreateDialog
				parentId={currentFolderId}
				open={newFolderOpen}
				onOpenChange={setNewFolderOpen}
			/>
		</main>
	);
}
