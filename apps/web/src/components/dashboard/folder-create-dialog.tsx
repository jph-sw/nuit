import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { createFolderFn } from "#/data/files-actions";
import { foldersQueryOptions } from "#/data/files-query-options";
import { useAppForm } from "#/hooks/form";
import { useQueryClient } from "@tanstack/react-query";

export function FolderCreateDialog({
	parentId,
	open,
	onOpenChange,
}: {
	parentId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: { name: "" },
		onSubmit: async ({ value }) => {
			await createFolderFn({ data: { name: value.name, parent_id: parentId } });
			queryClient.invalidateQueries(foldersQueryOptions(parentId));
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New folder</DialogTitle>
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
								{isSubmitting ? "Creating..." : "Create"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
