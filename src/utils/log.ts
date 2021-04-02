import path from "path";

const styles: { [style: string]: string } = {
	info: `
		background: green;
		display: block;
	`,
	render: `
		background: rgb(120,192,224);
		background: linear-gradient(315deg, rgba(120,192,224,1) 0%, rgba(68,157,209,1) 100%);
		border-left: solid 4px #78C0E0;
		display: block;
		padding: 4px 4px 4px 10px;
		border-radius: 2px;
		color: white;
		font-size: 14px;
		font-weight: bold;
		initial-letter: 2;
	`,
	// Vert bleu
	useSession: `
		background: #0C7489;
		background: rgb(48,169,194);
		background: linear-gradient(315deg, rgba(48,169,194,1) 0%, rgba(12,116,137,1) 100%);
		border-left: solid 4px rgba(48,169,194,1);
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Bleu navy
	useRouter: `
		background: rgb(68,129,182);
		background: linear-gradient(315deg, rgba(68,129,182,1) 0%, rgba(38,84,124,1) 100%);
		border-left: solid 4px #4481b6;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Jaune
	useFactories: `
		background: rgb(247,206,59);
		background: linear-gradient(315deg, rgba(247,206,59,1) 0%, rgba(215,180,53,1) 100%);
		border-left: solid 4px #f7ce3b;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Bleu ciel
	useViewmodel: `
		background: rgb(87,196,229);
		background: linear-gradient(315deg, rgba(87,196,229,1) 0%, rgba(69,157,184,1) 100%);
		border-left: solid 4px #57c4e5;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Orange
	useStore: `
		background: rgb(240,159,111);
		background: linear-gradient(315deg, rgba(240,159,111,1) 0%, rgba(237,125,58,1) 100%);
		border-left: solid 4px #f09f6f;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Vert jaune
	useNotifications: `
		background: rgb(172,208,93);
		background: linear-gradient(315deg, rgba(172,208,93,1) 0%, rgba(135,178,42,1) 100%);
		border-left: solid 4px #acd05d;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	// Rouge
	useModals: `
		background: rgb(223,119,128);
		background: linear-gradient(315deg, rgba(223,119,128,1) 0%, rgba(186,59,70,1) 100%);
		border-left: solid 4px #df7780;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		color: white;
		font-size: 12px;
		font-weight: bold;
	`,
	step: `
		color: rgb(120,192,224);
		border: solid 4px #78C0E0;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		font-size: 16px;
		font-weight: 900;
		text-transform: uppercase;
	`,
	request: `
		color: rgb(120,192,224);
		border: solid 4px #78C0E0;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		font-size: 16px;
		font-weight: 900;
	`,
	responseSuccess: `
		color: rgb(172,208,93);
		border: solid 4px #acd05d;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		font-size: 16px;
		font-weight: 900;
	`,
	responseFail: `
		color: rgb(223,119,128);
		border: solid 4px #df7780;
		display: inline-block;
		width: 90%;
		padding: 2px 10px;
		border-radius: 2px;
		font-size: 16px;
		font-weight: 900;
	`,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const appDir = path.dirname(require!.main!.filename);

// Permet d'identifier l'origine de l'erreur.
function getStackTrace() {
	let obj = { stack: "" };
	Error.captureStackTrace(obj, getStackTrace);
	let origin = obj.stack.split("\n")[2];

	// Renvoie la ligne de code d'où provient l'erreur si elle ne provient pas d'un module
	if (origin && origin.includes("dist")) {
		origin = origin.trim().replace(appDir, "").replace("at ", "");
		return origin;
	}

	return obj.stack;
}

function message(style: string, ...messages: Array<string | undefined>) {
	printTitle();
	if (messages.length === 1 && typeof messages[0] === "string") {
		console.log(`%c${messages[0]}`, style);
	} else {
		console.log(...messages);
	}
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// CUSTOM METHODS FROM CUSTOM STYLES

type logMethod = (...messages: any[]) => void;
type groupMethod = () => void;
type groupEndMethod = (...messages: any[]) => void;

const customLogs: { [logStyle: string]: logMethod | groupMethod | groupEndMethod } = {};

const groups: any[] = [];

// POUR TOUS LES CUSTOM STYLES
for (const logStyle in styles) {
	// LOG //////////////////////////////////////////////////////////////
	// La fonction de log de base, avec le custom style
	customLogs[logStyle] = function (...messages: any) {
		if (messages.length >= 1) {
			printTitle();

			// On cherche un groupe enregistré du même style
			const group = groups.find((g) => g.style === logStyle);

			// S'il est trouvé
			if (group) {
				group.logs.push([...messages]);
			}
			// Si aucun groupe de ce style n'existe, on log immédiatement les messages, avec le custom style
			else {
				message(styles[logStyle], ...messages);
			}
		}
	};

	// GROUP //////////////////////////////////////////////////////////////
	// Ouvrir un groupe de log avec le custom style
	customLogs[`${logStyle}Group`] = function () {
		printTitle();
		groups.push({ style: logStyle, logs: [] });
	};

	// GROUP END //////////////////////////////////////////////////////////////
	// Ferme le groupe du custom style
	customLogs[`${logStyle}GroupEnd`] = function (title: string) {
		// On cherche le groupe enregistré du même style
		const group = groups.find((g) => g.style === logStyle);

		// S'il est trouvé
		if (group) {
			printTitle();

			if (group.logs && group.logs.length > 0) {
				console.groupCollapsed(`%c${title ? title : ""}`, styles[logStyle]);

				for (const log of group.logs) {
					message(styles[logStyle], ...log);
				}

				console.groupEnd();
			} else {
				message(styles[logStyle], title);
			}

			const groupIndex = groups.indexOf(group);
			groups.splice(groupIndex);
		} else {
			console.error(`Aucun groupe ${logStyle} n'est enregistré.`);
		}
	};
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// NATIVE METHODS
let renderCount = 0;

export function render(location: string) {
	pendingTitle = null;
	renderCount += 1;
	console.groupEnd();
	console.groupCollapsed(`%c⚛ RENDER ${renderCount} ${location}`, styles.render);
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

let requests: { name: string; id: any; route: string; requestObject: any; renderCount: number }[] = [];
let requestID = 0;

/**
 *
 * @param name Le nom de la requête
 * @param requestObject L'objet envoyé au serveur
 * @param messages Les messages à afficher
 */
export function request(name: string, route: string, requestObject: any, ...messages: any[]) {
	printTitle();

	requestID += 1;
	requests.push({ name, id: requestID, route, renderCount, requestObject });

	let messageString = "";
	let rest: any[] = [];

	for (let index = 0; index < messages.length; index += 1) {
		const m = messages[index];

		if (typeof m === "string") {
			messageString += `${messageString.length > 0 ? " " : ""}${m}`;
		} else {
			// @ts-ignore
			rest = messages.slice(index);
			break;
		}
	}

	console.groupCollapsed(
		`%cREQUEST ${name}${messageString && messageString.length > 0 ? ` - ${messageString}` : ""}`,
		styles.request
	);
	message("", "Route :", route);
	message("", "Request :", requestObject);
	message("", ...rest);
	console.groupEnd();

	return requestID;
}

/**
 *
 * @param name Le nom de la requête initiale qui vient d'être répondu
 * @param id L'ID qu'avait retourné la fonction log.request
 * @param responseObject L'objet que le serveur a renvoyé
 * @param messages Les messages à afficher
 */
export function response(name: string, id: any, responseObject: any, success: boolean, ...messages: any[]) {
	printTitle();

	let messageString = "";
	let rest: any[] = [];

	for (let index = 0; index < messages.length; index += 1) {
		const m = messages[index];

		if (typeof m === "string") {
			messageString += `${messageString.length > 0 ? " " : ""}${m}`;
		} else {
			rest = messages.slice(index);
			break;
		}
	}

	const initialRequest = requests.find((r) => r.name === name && r.id === id);

	if (initialRequest) {
		console.groupCollapsed(
			`%cRESPONSE ${name} - ${initialRequest.renderCount}${
				messageString && messageString.length > 0 ? ` - ${messageString}` : ""
			}`,
			success ? styles.responseSuccess : styles.responseFail
		);

		message("", `Request was made during render ${initialRequest.renderCount}`);
		message("", "Route :", initialRequest.route);
		message("", success ? "success" : "fail");
		message("", "Initial request :", initialRequest.requestObject);
		message("", "Response :", responseObject);
		message("", ...rest);

		console.groupEnd();
	} else {
		console.groupCollapsed(
			`%cRESPONSE ${name}${messageString && messageString.length > 0 ? ` - ${messageString}` : ""}`,
			styles.request
		);

		message("", success ? "success" : "fail");
		message("", "Response :", responseObject);
		message("", ...rest);

		console.groupEnd();
	}
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

let pendingTitle: string | null = null;

export function title(t: string) {
	pendingTitle = t;
}

function printTitle() {
	if (pendingTitle) {
		console.log(`%c${pendingTitle}`, "font-size: 16px; font-weight: 100; color: white; padding: 6px;");
		pendingTitle = null;
	}
}

export function trace() {
	printTitle();
	console.trace();
}

export function linebreak() {
	console.log();
}

const log: {
	render: (location: string) => void;
	linebreak: () => void;
	lb: () => void;
	trace: () => void;
	request: (name: string, route: string, requestObject: any, ...messages: any[]) => number;
	response: (name: string, id: any, responseObject: any, success: boolean, ...messages: any[]) => void;
} & {
	[logStyle: string]: any;
} = {
	...customLogs,
	linebreak,
	request,
	response,
	title,
	lb: linebreak,
	trace,
	render,
};

export default log;

// TODO : Réécrire les fonctions de log dans une seule classe
// Le code ci dessous est un début de refactoring du système de logs
/*

const hookStyle = `
	background: #0C7489;
	background: rgb(48,169,194);
	background: linear-gradient(315deg, rgba(48,169,194,1) 0%, rgba(12,116,137,1) 100%);
	border-left: solid 4px rgba(48,169,194,1);
	display: inline-block;
	width: 90%;
	padding: 2px 10px;
	border-radius: 2px;
	color: white;
	font-size: 12px;
	font-weight: bold;
`;

const hookStyles = {
	useFactories: ["#F94144"],
	useModals: ["#F3722C"],
	useNotifications: ["#F8961E"],
	useRouter: ["#F9C74F"],
	useSession: ["#90BE6D"],
	useStore: ["#43AA8B"],
	useViewModel: ["#577590"],
};

type hookMethods = {
	log : ()=> void;
	start: ()=> void;
	end : ()=> void;
	request: ()=> void;
}

class consoleClass {
	hook : {[hookName in keyof typeof hookStyles] : }
}
*/
