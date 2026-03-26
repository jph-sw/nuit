import { migrate } from "./db/migrations";
import {
	authMeRoute,
	authSignInRoute,
	authSignOutRoute,
	authSignUpRoute,
} from "./routes/auth/index";
import { fileDownloadRoute } from "./routes/file/download";
import { fileRenameRoute } from "./routes/file/rename";
import { fileUploadRoute } from "./routes/file/upload";
import { filesRoute } from "./routes/files";
import { Log } from "./utils/log";

const PORT = 3001;

const logger = new Log();

migrate();

Bun.serve({
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
		"/api/file/download/:filename": fileDownloadRoute,
		"/api/file/rename/:id": fileRenameRoute,
		"/api/files": filesRoute,
	},
});

logger.log("Server is running on port", PORT);
