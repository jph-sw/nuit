import { folderAncestorsQueryOptions } from "#/data/files-query-options";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";

export function FolderBreadcrumb({
	currentFolderId,
	onNavigate,
}: {
	currentFolderId: string | null;
	onNavigate: (id: string | null) => void;
}) {
	const { data: ancestors } = useQuery({
		...folderAncestorsQueryOptions(currentFolderId ?? ""),
		enabled: currentFolderId !== null,
	});

	return (
		<nav className="flex items-center gap-1 text-sm mb-3">
			<button
				type="button"
				onClick={() => onNavigate(null)}
				className={`hover:text-foreground ${currentFolderId ? "text-muted-foreground" : "text-foreground font-medium"}`}
			>
				Files
			</button>
			{ancestors?.map((crumb) => (
				<>
					<HugeiconsIcon
						key={`sep-${crumb.id}`}
						icon={ArrowRight01Icon}
						size={14}
						className="text-muted-foreground"
					/>
					<button
						key={crumb.id}
						type="button"
						onClick={() => onNavigate(crumb.id)}
						className="text-muted-foreground hover:text-foreground last:text-foreground last:font-medium"
					>
						{crumb.name}
					</button>
				</>
			))}
		</nav>
	);
}
