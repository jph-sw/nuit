import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/files/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/files/"!</div>;
}
