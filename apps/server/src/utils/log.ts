import * as fs from "fs";
import * as path from "path";

const tzOffset = new Date().getTimezoneOffset() * 60000;

const COLORS = Object.freeze({
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
});

type ColorScheme = {
	id: string;
	datetime: string;
	message: string;
	level: string;
};

// biome-ignore lint/suspicious/noExplicitAny: Allow any for flexible logging arguments
type LogArgs = any[];

const LEVELS: Record<string, ColorScheme> = Object.freeze({
	default: {
		id: COLORS.blue,
		datetime: COLORS.green,
		message: COLORS.white,
		level: COLORS.white,
	},
	info: {
		id: COLORS.blue,
		datetime: COLORS.white,
		message: COLORS.blue,
		level: COLORS.blue,
	},
	warn: {
		id: COLORS.blue,
		datetime: COLORS.white,
		message: COLORS.yellow,
		level: COLORS.yellow,
	},
	error: {
		id: COLORS.blue,
		datetime: COLORS.red,
		message: COLORS.red,
		level: COLORS.red,
	},
	debug: {
		id: COLORS.blue,
		datetime: COLORS.green,
		message: COLORS.white,
		level: COLORS.magenta,
	},
});

function formatArgs(args: LogArgs): string {
	return args
		.map((arg) => {
			if (typeof arg === "object") {
				return JSON.stringify(arg, null, 2);
			}
			return String(arg);
		})
		.join(" ");
}

function messageFactory({
	id = "",
	level,
	args = [],
	colors = LEVELS.default,
}: {
	id?: string;
	level?: string;
	args?: LogArgs;
	colors?: ColorScheme;
}): string {
	const timestamp = new Date(Date.now() - tzOffset)
		.toISOString()
		.replace("T", " ")
		.replace("Z", "");
	let message = `${COLORS.reset}${colors?.datetime}[${timestamp}]${COLORS.reset}`;

	if (id) {
		message += `${COLORS.reset} - ${colors?.id}[id:${id}]${COLORS.reset}`;
	}

	if (level) {
		const levelStr = level.length === 4 ? `${level} ` : level;
		message += `${COLORS.reset} - ${colors?.level}[${levelStr}]${COLORS.reset}`;
	}
	message += `${COLORS.reset} - ${colors?.message}${formatArgs(args)}${COLORS.reset}`;

	return message;
}

function stripAnsiCodes(text: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: <>
	return text.replace(/\x1b\[\d{1,2}m|\x1b\[0m/g, "");
}

function writeToFile(message: string, filePath: string): void {
	fs.appendFileSync(filePath, `${stripAnsiCodes(message)}\n`, "utf8");
}

function formatDate(date: Date, format: string): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	const replacements: Record<string, string | number> = {
		YYYY: year,
		YY: String(year).slice(-2),
		MM: month,
		DD: day,
		HH: hours,
		mm: minutes,
		ss: seconds,
		M: String(date.getMonth() + 1),
		D: String(date.getDate()),
		H: String(date.getHours()),
		m: String(date.getMinutes()),
		s: String(date.getSeconds()),
	};
	let formatted = format;
	for (const [token, value] of Object.entries(replacements)) {
		formatted = formatted.replace(new RegExp(token, "g"), String(value));
	}

	return formatted;
}

function getDayBasedFilePath(originalPath: string, dateFormat: string): string {
	const now = new Date();
	const datePrefix = `${formatDate(now, dateFormat)}-`;

	const dir = path.dirname(originalPath);
	const basename = path.basename(originalPath);

	return path.join(dir, `${datePrefix}${basename}`);
}

export class Log {
	private currentId: string = "";
	private logPath?: string;
	private toStdout: boolean = true;
	private dayBasedFileLog: boolean = false;
	private dateFormat: string = "YYYYMMDD";

	constructor({
		id = "",
		logPath,
		toStdout = true,
		dayBasedFileLog = false,
		dateFormat = "YYYYMMDD",
	}: {
		id?: string;
		logPath?: string;
		toStdout?: boolean;
		dayBasedFileLog?: boolean;
		dateFormat?: string;
	} = {}) {
		this.currentId = id;
		this.logPath = logPath;
		this.toStdout = toStdout;
		this.dayBasedFileLog = dayBasedFileLog;
		this.dateFormat = dateFormat;
	}

	private createLogHandler(colors: ColorScheme, level?: string) {
		return (...args: LogArgs) => {
			const message = messageFactory({
				id: this.currentId || "",
				colors: colors as ColorScheme,
				level,
				args,
			});
			if (this.toStdout) {
				console.log(message);
			}
			if (this.logPath) {
				const filePath = this.dayBasedFileLog
					? getDayBasedFilePath(this.logPath, this.dateFormat)
					: this.logPath;
				writeToFile(message, filePath);
			}
		};
	}

	log(...args: LogArgs): void {
		this.createLogHandler(LEVELS.default as ColorScheme)(...args);
	}

	info(...args: LogArgs): void {
		this.createLogHandler(LEVELS.info as ColorScheme, "info")(...args);
	}

	warn(...args: LogArgs): void {
		this.createLogHandler(LEVELS.warn as ColorScheme, "warn")(...args);
	}

	error(...args: LogArgs): void {
		this.createLogHandler(LEVELS.error as ColorScheme, "error")(...args);
	}

	debug(...args: LogArgs): void {
		this.createLogHandler(LEVELS.debug as ColorScheme, "debug")(...args);
	}

	setId(id: string): Log {
		this.currentId = id;
		return this;
	}
}
