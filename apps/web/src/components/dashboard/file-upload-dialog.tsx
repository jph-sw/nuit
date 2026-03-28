import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { uploadFileFn } from "#/data/files-actions";
import { filesQueryOptions } from "#/data/files-query-options";
import { useAppForm } from "#/hooks/form";
import { Add01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve((reader.result as string).split(",")[1]);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export function FileUploadDialog({ folderId = null }: { folderId?: string | null }) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: {
			files: [] as File[],
		},
		onSubmit: async ({ value }) => {
			for (const file of value.files) {
				const base64 = await fileToBase64(file);
				await uploadFileFn({ data: { filename: file.name, base64, folder_id: folderId } });
			}
			queryClient.invalidateQueries(filesQueryOptions(folderId));
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button size="sm">
						<HugeiconsIcon icon={Add01Icon} />
						Upload
					</Button>
				}
			/>
			<DialogContent className="min-w-2xl">
				<DialogHeader>
					<DialogTitle>Upload files</DialogTitle>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<form.AppField
						name="files"
						children={(field) => (
							<label className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-ring hover:bg-accent/20">
								<HugeiconsIcon
									icon={Upload01Icon}
									size={24}
									strokeWidth={1.5}
									className="text-muted-foreground"
								/>
								<div>
									<p className="text-sm font-medium">Click to select files</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										or drag and drop here
									</p>
								</div>
								{field.state.value.length > 0 && (
									<p className="text-xs text-foreground">
										{field.state.value.length} file
										{field.state.value.length !== 1 ? "s" : ""} selected
									</p>
								)}
								<input
									type="file"
									multiple
									className="sr-only"
									onChange={(e) =>
										field.handleChange(Array.from(e.target.files ?? []))
									}
								/>
							</label>
						)}
					/>
					<form.Subscribe
						selector={(state) => state.isSubmitting}
						children={(isSubmitting) => (
							<Button type="submit" disabled={isSubmitting} size="sm">
								{isSubmitting ? "Uploading…" : "Upload"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
