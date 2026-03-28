import { Button } from "#/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "#/components/ui/context-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { deleteFolderFn } from "#/data/files-actions";
import { foldersQueryOptions } from "#/data/files-query-options";
import { FolderRenameDialog } from "#/components/dashboard/folder-rename-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Edit04Icon,
	Folder01Icon,
	MoreVerticalIcon,
	Trash2,
} from "@hugeicons/core-free-icons";
import type { Folder } from "@nuit/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function FolderCard({
	folder,
	onOpen,
}: {
	folder: Folder;
	onOpen: () => void;
}) {
	const [renameOpen, setRenameOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleDelete = async () => {
		try {
			await deleteFolderFn({ data: { id: folder.id } });
			queryClient.invalidateQueries(foldersQueryOptions(folder.parent_id));
		} catch {
			// TODO: show error toast (folder not empty)
		}
	};

	const menuContent = (
		Item: typeof DropdownMenuItem | typeof ContextMenuItem,
		Group: typeof DropdownMenuGroup | typeof ContextMenuGroup,
		Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator,
	) => (
		<>
			<Group>
				<Item onClick={() => setRenameOpen(true)}>
					<HugeiconsIcon icon={Edit04Icon} />
					Rename
				</Item>
			</Group>
			<Separator />
			<Group>
				<Item onClick={handleDelete}>
					<HugeiconsIcon icon={Trash2} />
					Delete
				</Item>
			</Group>
		</>
	);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div
						className="group flex w-36 cursor-pointer select-none flex-col rounded-lg border bg-card transition-colors hover:bg-accent/40"
						onClick={onOpen}
					>
						<div className="flex h-20 items-center justify-center rounded-t-lg">
							<HugeiconsIcon
								icon={Folder01Icon}
								size={32}
								strokeWidth={1.5}
								className="text-muted-foreground"
							/>
						</div>
						<div className="flex items-center gap-1 border-t px-2 py-1.5">
							<p className="min-w-0 flex-1 truncate text-xs">{folder.name}</p>
							<DropdownMenu>
								<DropdownMenuTrigger
									onClick={(e) => e.stopPropagation()}
									children={
										<Button
											size="icon-xs"
											variant="ghost"
											className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
										>
											<HugeiconsIcon icon={MoreVerticalIcon} />
										</Button>
									}
								/>
								<DropdownMenuContent className="w-40" align="start">
									{menuContent(DropdownMenuItem, DropdownMenuGroup, DropdownMenuSeparator)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent className="w-40">
					{menuContent(ContextMenuItem, ContextMenuGroup, ContextMenuSeparator)}
				</ContextMenuContent>
			</ContextMenu>
			<FolderRenameDialog folder={folder} open={renameOpen} onOpenChange={setRenameOpen} />
		</>
	);
}
