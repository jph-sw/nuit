import { Link, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { signOutFn } from "../lib/auth";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Header() {
	const { user } = useRouteContext({ from: "__root__" });
	const signOut = useServerFn(signOutFn);

	return (
		<header className="sticky top-0 z-50 h-12 border-b bg-background/90 backdrop-blur-sm">
			<div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
				<Link
					to="/"
					className="font-display text-base font-semibold tracking-tight text-foreground transition-opacity hover:opacity-75"
				>
					nuit
				</Link>

				<div className="flex items-center gap-1">
					<ThemeToggle />
					{user ? (
						<>
							<span className="hidden px-2 text-xs text-muted-foreground sm:block">
								{user.username}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => signOut()}
							>
								Sign out
							</Button>
						</>
					) : (
						<Button variant="ghost" size="sm" render={<Link to="/login">Sign in</Link>} />
					)}
				</div>
			</div>
		</header>
	);
}
