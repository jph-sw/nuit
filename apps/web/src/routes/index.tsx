import { FileTable } from "#/components/dashboard/file-table";
import { Card, CardContent } from "#/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14 flex justify-center">
			<div className="w-6xl"></div>
		</main>
	);
}
