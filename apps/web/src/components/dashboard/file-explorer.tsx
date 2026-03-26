import type { File } from "@nuit/types";

export function FileExplorer({ files }: { files: File[] }) {
	return (
		<div className="w-full h-200 border rounded flex flex-wrap gap-1 p-2">
			{files.map((file) => (
				<div className="h-25 w-25 rounded border bg-secondary flex justify-center items-center hover:border-gray-700">
					<p>{file.filename}</p>
				</div>
			))}
		</div>
	);
}
