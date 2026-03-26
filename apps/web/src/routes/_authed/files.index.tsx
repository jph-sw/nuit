import { FileTable } from "#/components/dashboard/file-table";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { filesQueryOptions } from "#/data/files-query-options";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ListViewIcon,
	FolderFileStorageIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { FileExplorer } from "#/components/dashboard/file-explorer";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";

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
              <Dialog>
                <DialogTrigger render={<Button><HugeiconsIcon icon={Add01Icon} />Upload</Button>} />
                <DialogContent className={"min-w-2xl"}>
                  <DialogHeader>
                    <DialogTitle>Upload file/s</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <Input type="file" multiple />
                    <Button>Upload</Button>
                  </form>
                </DialogContent>
              </Dialog>
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
