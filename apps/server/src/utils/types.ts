export interface Session {
	id: string;
	userId: string;
	secretHash: Uint8Array;
	createdAt: Date;
}

export interface SessionWithToken extends Session {
	token: string;
}
