import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import type { File } from "@nuit/types";

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-4 py-2 border-b last:border-0">
			<span className="text-muted-foreground text-sm">{label}</span>
			<span className="text-sm font-medium text-right break-all">{value}</span>
		</div>
	);
}

export function FileDetailsDialog({
	file,
	open,
	onOpenChange,
}: {
	file: File;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>File details</DialogTitle>
				</DialogHeader>
				<div className="mt-2">
					<Row label="Filename" value={file.filename} />
					<Row label="Size" value={formatSize(file.size)} />
					<Row label="Type" value={file.mime_type ?? "Unknown"} />
					<Row label="Uploaded" value={new Date(file.created_at).toLocaleString()} />
					<Row label="ID" value={file.id} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
