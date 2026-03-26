import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { renameFolderFn } from "#/data/files-actions";
import { foldersQueryOptions } from "#/data/files-query-options";
import { useAppForm } from "#/hooks/form";
import type { Folder } from "@nuit/types";
import { useQueryClient } from "@tanstack/react-query";

export function FolderRenameDialog({
	folder,
	open,
	onOpenChange,
}: {
	folder: Folder;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: { name: folder.name },
		onSubmit: async ({ value }) => {
			await renameFolderFn({ data: { id: folder.id, name: value.name } });
			queryClient.invalidateQueries(foldersQueryOptions(folder.parent_id));
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename folder</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.AppField
						name="name"
						children={(field) => <field.TextField label="Folder name" />}
					/>
					<form.Subscribe
						selector={(s) => s.isSubmitting}
						children={(isSubmitting) => (
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Renaming..." : "Rename"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
