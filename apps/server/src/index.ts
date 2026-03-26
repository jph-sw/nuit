import { migrate } from "./db/migrations";
import {
	authMeRoute,
	authSignInRoute,
	authSignOutRoute,
	authSignUpRoute,
} from "./routes/auth/index";
import { fileDownloadRoute } from "./routes/file/download";
import { fileMoveRoute } from "./routes/file/move";
import { fileRenameRoute } from "./routes/file/rename";
import { fileUploadRoute } from "./routes/file/upload";
import { folderAncestorsRoute } from "./routes/folder/ancestors";
import { folderCreateRoute } from "./routes/folder/create";
import { folderDeleteRoute } from "./routes/folder/delete";
import { folderRenameRoute } from "./routes/folder/rename";
import { filesRoute } from "./routes/files";
import { foldersRoute } from "./routes/folders";
import { Log } from "./utils/log";

const PORT = 3001;
const logger = new Log();

migrate();

Bun.serve({
	port: PORT,
	routes: {
		"/api/health": {
			GET: () => new Response("healthy"),
		},
		"/api/auth/sign-up": authSignUpRoute,
		"/api/auth/sign-in": authSignInRoute,
		"/api/auth/sign-out": authSignOutRoute,
		"/api/auth/me": authMeRoute,
		"/api/file/upload": fileUploadRoute,
		"/api/file/download/:id": fileDownloadRoute,
		"/api/file/rename/:id": fileRenameRoute,
		"/api/file/move/:id": fileMoveRoute,
		"/api/files": filesRoute,
		"/api/folders": foldersRoute,
		"/api/folder": folderCreateRoute,
		"/api/folder/:id/ancestors": folderAncestorsRoute,
		"/api/folder/rename/:id": folderRenameRoute,
		"/api/folder/:id": folderDeleteRoute,
	},
});

logger.log("Server is running on port", PORT);
