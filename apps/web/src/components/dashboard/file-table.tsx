import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { File } from "@nuit/types";

export function FileTable({ files }: { files: File[] }) {
	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-25">Filename</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{files.map((file) => (
						<TableRow>
							<TableCell>{file.filename}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
