import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import type { File } from "@nuit/types";

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function FileTable({ files }: { files: File[] }) {
	if (files.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
				No files in this folder
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead className="hidden w-48 sm:table-cell">Type</TableHead>
					<TableHead className="hidden w-24 text-right sm:table-cell">Size</TableHead>
					<TableHead className="hidden w-36 text-right md:table-cell">Uploaded</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{files.map((file) => (
					<TableRow key={file.id}>
						<TableCell className="font-medium">{file.filename}</TableCell>
						<TableCell className="hidden text-muted-foreground sm:table-cell">
							{file.mime_type ?? "—"}
						</TableCell>
						<TableCell className="hidden text-right text-muted-foreground sm:table-cell">
							{formatSize(file.size)}
						</TableCell>
						<TableCell className="hidden text-right text-muted-foreground md:table-cell">
							{new Date(file.created_at).toLocaleDateString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
