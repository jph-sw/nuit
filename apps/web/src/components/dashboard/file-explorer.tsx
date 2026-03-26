import type { File } from "@nuit/types";
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
	InformationCircleIcon,
	MoreVerticalIcon,
	Move01Icon,
	Share01Icon,
	Trash2,
} from "@hugeicons/core-free-icons";

type MenuItem = {
	label: string;
	icon: typeof Download01Icon;
	destructive?: boolean;
	onClick?: () => void;
};

type MenuGroup = MenuItem[];

const fileMenuGroups: MenuGroup[] = [
	[
		{ label: "Download", icon: Download01Icon },
		{ label: "Share", icon: Share01Icon },
	],
	[
		{ label: "Move to folder", icon: Move01Icon },
		{ label: "Make a copy", icon: Copy01Icon },
		{ label: "Rename", icon: Edit04Icon },
		{ label: "Details", icon: InformationCircleIcon },
	],
	[{ label: "Move to trash", icon: Trash2, destructive: true }],
];

export function FileExplorer({ files }: { files: File[] }) {
	return (
		<div className="w-full h-fit border rounded-md flex flex-wrap gap-1 p-2">
			{files.map((file) => (
				<ContextMenu key={file.id}>
					<ContextMenuTrigger>
						<div className="h-40 w-50 group rounded border bg-secondary flex flex-col justify-end hover:border-gray-700">
							{/*placeholder for image, icon etc*/}
							<div className="..." />
							<div className="bg-linear-to-t from-background to-transparent rounded h-8 flex w-full justify-between items-center px-1">
								<p className="truncate flex h-fit">{file.filename}</p>
								<DropdownMenu>
									<DropdownMenuTrigger
										children={
											<Button size={"icon-xs"} variant={"outline"}>
												<HugeiconsIcon icon={MoreVerticalIcon} />
											</Button>
										}
									/>
									<DropdownMenuContent className="w-40" align="start">
										{fileMenuGroups.map((group, i) => (
											<>
												{i > 0 && <DropdownMenuSeparator />}
												<DropdownMenuGroup key={i}>
													{group.map((item) => (
														<DropdownMenuItem
															key={item.label}
															variant={
																item.destructive ? "destructive" : undefined
															}
														>
															<HugeiconsIcon icon={item.icon} />
															{item.label}
														</DropdownMenuItem>
													))}
												</DropdownMenuGroup>
											</>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent className="w-40">
						{fileMenuGroups.map((group, i) => (
							<>
								{i > 0 && <ContextMenuSeparator />}
								<ContextMenuGroup key={i}>
									{group.map((item) => (
										<ContextMenuItem
											key={item.label}
											className={
												item.destructive ? "text-destructive" : undefined
											}
										>
											<HugeiconsIcon icon={item.icon} />
											{item.label}
										</ContextMenuItem>
									))}
								</ContextMenuGroup>
							</>
						))}
					</ContextMenuContent>
				</ContextMenu>
			))}
		</div>
	);
}
