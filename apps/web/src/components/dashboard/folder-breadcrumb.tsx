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
		<nav className="flex items-center gap-1 text-sm">
			<button
				type="button"
				onClick={() => onNavigate(null)}
				className={`transition-colors hover:text-foreground ${currentFolderId ? "text-muted-foreground" : "font-medium text-foreground"}`}
			>
				Files
			</button>
			{ancestors?.map((crumb) => (
				<>
					<HugeiconsIcon
						key={`sep-${crumb.id}`}
						icon={ArrowRight01Icon}
						size={12}
						className="text-muted-foreground/50"
					/>
					<button
						key={crumb.id}
						type="button"
						onClick={() => onNavigate(crumb.id)}
						className="text-muted-foreground transition-colors hover:text-foreground last:font-medium last:text-foreground"
					>
						{crumb.name}
					</button>
				</>
			))}
		</nav>
	);
}
