import { migrate } from "./db/migrations";
import {
	authMeRoute,
	authSignInRoute,
	authSignOutRoute,
	authSignUpRoute,
} from "./routes/auth/index";
import { fileUploadRoute } from "./routes/file/upload";
import { filesRoute } from "./routes/files";
import { Log } from "./utils/log";

const PORT = 3001;

const logger = new Log();

migrate();

const server = Bun.serve({
	port: PORT,
	routes: {
		"/api/health": {
			GET: () => {
				return new Response("healthy");
			},
		},
		"/api/auth/sign-up": authSignUpRoute,
		"/api/auth/sign-in": authSignInRoute,
		"/api/auth/sign-out": authSignOutRoute,
		"/api/auth/me": authMeRoute,
		"/api/file/upload": fileUploadRoute,
		"/api/files": filesRoute,
	},
});

logger.log("Server is running on port", PORT);
