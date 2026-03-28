import type { File, Folder } from "@nuit/types";
import { downloadFileFn } from "#/data/files-actions";
import { FileRenameDialog } from "#/components/dashboard/file-rename-dialog";
import { FileDetailsDialog } from "#/components/dashboard/file-details-dialog";
import { FileMoveDialog } from "#/components/dashboard/file-move-dialog";
import { FolderCard } from "#/components/dashboard/folder-card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "#/components/ui/context-menu";
import { Button } from "#/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Copy01Icon,
	Download01Icon,
	Edit04Icon,
	File01Icon,
	Folder01Icon,
	InformationCircleIcon,
	MoreVerticalIcon,
	Move01Icon,
	Share01Icon,
	Trash2,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

type MenuItem = {
	label: string;
	icon: typeof Download01Icon;
	destructive?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

type MenuGroup = MenuItem[];

function FileCard({ file }: { file: File }) {
	const [renameOpen, setRenameOpen] = useState(false);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [moveOpen, setMoveOpen] = useState(false);

	function fileMenuGroups(): MenuGroup[] {
		return [
			[
				{
					label: "Download",
					icon: Download01Icon,
					onClick: async () => {
						const { blob, mimeType, filename } = await downloadFileFn({
							data: { id: file.id },
						});
						const url = URL.createObjectURL(
							new Blob([Uint8Array.from(atob(blob), (c) => c.charCodeAt(0))], { type: mimeType }),
						);
						const a = document.createElement("a");
						a.href = url;
						a.download = filename;
						a.click();
						URL.revokeObjectURL(url);
					},
				},
				{ label: "Share", icon: Share01Icon, disabled: true },
			],
			[
				{ label: "Move to folder", icon: Move01Icon, onClick: () => setMoveOpen(true) },
				{ label: "Make a copy", icon: Copy01Icon },
				{ label: "Rename", icon: Edit04Icon, onClick: () => setRenameOpen(true) },
				{ label: "Details", icon: InformationCircleIcon, onClick: () => setDetailsOpen(true) },
			],
			[{ label: "Move to trash", icon: Trash2, destructive: true }],
		];
	}

	const groups = fileMenuGroups();

	const menuContent = (
		MenuItem: typeof DropdownMenuItem | typeof ContextMenuItem,
		Group: typeof DropdownMenuGroup | typeof ContextMenuGroup,
		Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator,
	) =>
		groups.map((group, i) => (
			<>
				{i > 0 && <Separator />}
				<Group key={i}>
					{group.map((item) => (
						<MenuItem
							key={item.label}
							disabled={item.disabled}
							onClick={item.onClick}
						>
							<HugeiconsIcon icon={item.icon} />
							{item.label}
						</MenuItem>
					))}
				</Group>
			</>
		));

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="group flex w-36 cursor-default select-none flex-col rounded-lg border bg-card transition-colors hover:bg-accent/40">
						<div className="flex h-20 items-center justify-center rounded-t-lg">
							<HugeiconsIcon
								icon={File01Icon}
								size={28}
								strokeWidth={1.5}
								className="text-muted-foreground"
							/>
						</div>
						<div className="flex items-center gap-1 border-t px-2 py-1.5">
							<p className="min-w-0 flex-1 truncate text-xs">{file.filename}</p>
							<DropdownMenu>
								<DropdownMenuTrigger
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
			<FileRenameDialog file={file} open={renameOpen} onOpenChange={setRenameOpen} />
			<FileDetailsDialog file={file} open={detailsOpen} onOpenChange={setDetailsOpen} />
			<FileMoveDialog file={file} open={moveOpen} onOpenChange={setMoveOpen} />
		</>
	);
}

export function FileExplorer({
	files,
	folders,
	onNavigate,
}: {
	files: File[];
	folders: Folder[];
	onNavigate: (id: string) => void;
}) {
	if (folders.length === 0 && files.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
				<HugeiconsIcon
					icon={Folder01Icon}
					size={36}
					strokeWidth={1}
					className="text-muted-foreground/40"
				/>
				<p className="text-xs text-muted-foreground">This folder is empty</p>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2 p-3">
			{folders.map((folder) => (
				<FolderCard key={folder.id} folder={folder} onOpen={() => onNavigate(folder.id)} />
			))}
			{files.map((file) => (
				<FileCard key={file.id} file={file} />
			))}
		</div>
	);
}
