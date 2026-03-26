import { FileTable } from "#/components/dashboard/file-table";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { filesQueryOptions } from "#/data/files-query-options";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ListViewIcon,
	FolderFileStorageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { FileExplorer } from "#/components/dashboard/file-explorer";
import { FileUploadDialog } from "#/components/dashboard/file-upload-dialog";

export const Route = createFileRoute("/_authed/files/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [viewType, setViewType] = useState("explorer");

	const { data: files } = useQuery(filesQueryOptions);

	return (
		<main className="page-wrap px-4 pb-8 pt-14 flex justify-center">
			<div className="w-6xl">
				<Card>
					<CardHeader>
						<div className="flex w-full justify-between items-center">
							<FileUploadDialog />
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
						{files ? (
							viewType === "explorer" ? (
								<FileExplorer files={files} />
							) : (
								<FileTable files={files} />
							)
						) : (
							"Loading"
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
