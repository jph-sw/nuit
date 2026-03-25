import { Link, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { signOutFn } from "../lib/auth";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

export default function Header() {
	const { user } = useRouteContext({ from: "__root__" });
	const signOut = useServerFn(signOutFn);

	return (
		<header className="sticky top-0 z-50 border-b px-4 backdrop-blur-lg">
			<nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
				<div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
					<ThemeToggle />
					{user ? (
						<div className="flex items-center gap-2">
							<span className="hidden text-sm text-[var(--sea-ink-soft)] sm:block">
								{user.username}
							</span>
							<Button
								type="button"
								onClick={() => signOut()}
							>
								Sign out
							</Button>
						</div>
          ) : (
              <Button render={	<Link
							to="/login"
						>
							Sign in
						</Link>}/>

					)}
				</div>
			</nav>
		</header>
	);
}
