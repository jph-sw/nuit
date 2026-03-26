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
import { Add01Icon } from "@hugeicons/core-free-icons";
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

export function FileUploadDialog() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useAppForm({
		defaultValues: {
			files: [] as File[],
		},
		onSubmit: async ({ value }) => {
			for (const file of value.files) {
				const base64 = await fileToBase64(file);
				await uploadFileFn({ data: { filename: file.name, base64 } });
			}
			queryClient.invalidateQueries(filesQueryOptions);
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<HugeiconsIcon icon={Add01Icon} />
						Upload
					</Button>
				}
			/>
			<DialogContent className={"min-w-2xl"}>
				<DialogHeader>
					<DialogTitle>Upload file/s</DialogTitle>
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
							<input
								type="file"
								multiple
								className="w-full"
								onChange={(e) =>
									field.handleChange(Array.from(e.target.files ?? []))
								}
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => state.isSubmitting}
						children={(isSubmitting) => (
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Uploading..." : "Upload"}
							</Button>
						)}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
