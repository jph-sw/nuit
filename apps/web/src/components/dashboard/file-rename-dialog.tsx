import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { renameFileFn } from "#/data/files-actions";
import { filesQueryOptions } from "#/data/files-query-options";
import { useAppForm } from "#/hooks/form";
import type { File } from "@nuit/types";
import { useQueryClient } from "@tanstack/react-query";

export function FileRenameDialog({
	file,
	open,
	onOpenChange,
}: {
	file: File;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: { filename: file.filename },
		onSubmit: async ({ value }) => {
			await renameFileFn({ data: { id: file.id, filename: value.filename } });
			queryClient.invalidateQueries(filesQueryOptions);
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename file</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.AppField
						name="filename"
						children={(field) => (
							<field.TextField label="Filename" />
						)}
					/>
					<form.Subscribe
						selector={(state) => state.isSubmitting}
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
