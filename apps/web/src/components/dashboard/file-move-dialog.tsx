import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { moveFileFn } from "#/data/files-actions";
import { allFoldersQueryOptions, filesQueryOptions } from "#/data/files-query-options";
import type { File, Folder } from "@nuit/types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function getDepth(folder: Folder, all: Folder[]): number {
	let depth = 0;
	let current = folder;
	while (current.parent_id) {
		depth++;
		const parent = all.find((f) => f.id === current.parent_id);
		if (!parent) break;
		current = parent;
	}
	return depth;
}

export function FileMoveDialog({
	file,
	open,
	onOpenChange,
}: {
	file: File;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [selected, setSelected] = useState<string | null>(file.folder_id);
	const [moving, setMoving] = useState(false);

	const { data: allFolders = [] } = useQuery(allFoldersQueryOptions);

	const handleMove = async () => {
		if (selected === file.folder_id) {
			onOpenChange(false);
			return;
		}
		setMoving(true);
		try {
			await moveFileFn({ data: { id: file.id, folder_id: selected } });
			queryClient.invalidateQueries(filesQueryOptions(file.folder_id));
			queryClient.invalidateQueries(filesQueryOptions(selected));
			onOpenChange(false);
		} finally {
			setMoving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Move "{file.filename}"</DialogTitle>
				</DialogHeader>
				<div className="space-y-0.5 max-h-64 overflow-y-auto">
					<button
						type="button"
						onClick={() => setSelected(null)}
						className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left hover:bg-secondary ${selected === null ? "bg-secondary font-medium" : ""}`}
					>
						<HugeiconsIcon icon={Folder01Icon} size={16} />
						Root
					</button>
					{allFolders.map((folder) => {
						const depth = getDepth(folder, allFolders);
						return (
							<button
								key={folder.id}
								type="button"
								onClick={() => setSelected(folder.id)}
								style={{ paddingLeft: `${12 + depth * 16}px` }}
								className={`w-full flex items-center gap-2 pr-3 py-2 rounded text-sm text-left hover:bg-secondary ${selected === folder.id ? "bg-secondary font-medium" : ""}`}
							>
								<HugeiconsIcon icon={Folder01Icon} size={16} />
								{folder.name}
							</button>
						);
					})}
				</div>
				<Button onClick={handleMove} disabled={moving || selected === file.folder_id}>
					{moving ? "Moving..." : "Move here"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
