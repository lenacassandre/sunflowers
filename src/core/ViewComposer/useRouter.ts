import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams, Redirect, Router } from "react-router-dom";
import { View, ViewDeclaration, ViewsTree, Navigate, RouterSystem, SessionSystem } from "../../types";
import log from "../../utils/log";
import User from "../../classes/user.class";

type state<CustomUserModel> = [Navigate, ViewDeclaration<CustomUserModel, any>, {[key: string]: string}]

let mounted = false;

const RouterRef:any = {}



//////////////////////////////////////////////////////////////////////////////////////
// Retire les / et les espaces qui sont au début ou à la fin d'un chemin.
const trimPath = (path: string) => path.replace(/^\//, "").replace(/\/$/, "").trim()

/////////////////////////////////////////////////////////////////////////////////////////////////////
// On compare deux chemnins, en retirant le / s'il y en a un aut début.
const arePathEquals = (path1: string, path2: string) => trimPath(path1).toLowerCase() === trimPath(path2).toLowerCase();

//////////////////////////////////////////////////////////////////////////////////////////////////////:
// Renvoie un objet des paramètres de l'URL à partir de l'URL
const getParamsObjectfromURL = (): {[key: string]: string} =>  {
	const currentSearch = window.location.search;

	return currentSearch.replace("?", "").split("&").reduce((
		params: {[key: string]: string},
		search: string
	) => {
		if(search) {
			const [key, value] = search.split("=")
			params[key] = value
		}
		return params
	}, {})
}

/////////////////////////////////////////////////////////////////////////////////////////////

const pushHistoryState = <UserType extends User>(viewDeclaration: ViewDeclaration<UserType, any>, params?: {[key: string]: string}) => {
	console.log("PUSH HISTORY STATE", viewDeclaration)

	let searchString = "";

	// Parse les données de l'URL
	if(params && Object.keys(params).length > 0) {
		searchString = Object.keys(params).reduce((string, key, i) => {
			return `${string}${params ? `${i === 0 ? "?" : "&"}${key}=${params[key]}`: ""}`
		}, "")
	}

	let newPath = typeof viewDeclaration.path === "string" ? viewDeclaration.path : viewDeclaration.path[0]
	newPath = newPath || "/";

	window.history.pushState(
		"",
		viewDeclaration.title,
		newPath + searchString,
	)
}

// L'url avec laquelle a été ouverte l'app.
let initialPath = window.location.pathname || "";

if(initialPath[0] === "/") initialPath = initialPath.slice(1);

// Cette ligne sert à faire fonctionner connrectement le router avec Electron
if(initialPath.includes("index.html")) initialPath = "/";

let initialParams = getParamsObjectfromURL();

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
export default function useRouter<CustomUserModel extends User>(
	session: SessionSystem<CustomUserModel>,
	viewsTree: ViewsTree<CustomUserModel>,
	defaultViewDeclaration: ViewDeclaration<CustomUserModel, any>
): RouterSystem<CustomUserModel> {
	log.useRouterGroup();

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * Renvoie une déclaration de vue en fonction d'un chemin.
	 * La fonction peut renvoyer la déclaration de vue par défaut si aucune n'a été trouvée.
	 * @param path facultatif. S'il n'est pas donné, la fonction le remplacera par le chemin de l'URL.
	 */
	const getViewDeclarationFromPath = useCallback((viewPath?: string) => {
		let path = typeof viewPath === "string" ? viewPath : window.location.pathname || "/"; // get path from URL (part between domain and search)

		let viewDeclaration = viewsTree.find( // Cherche la vue correspondant au chemin
			viewDeclaration => {
				const viewDeclarationPath = viewDeclaration.path;

				// Vérifie également qu'un utilisateur est bien connecté si la vue le requiert.
				if(!viewDeclaration.auth || session.token) {
					// Le chemin d'une vue peut être une chaine de caractères ou un tableau.
					if(typeof viewDeclarationPath === "string") { // Dans le cas où le chemin est une chaine de caractères.
						return arePathEquals(viewDeclarationPath, path);
					}
					else if(Array.isArray(viewDeclarationPath)) { // Dans le cas où plusieurs chemin sont spécifiés dans un tableau.
						return viewDeclarationPath.some(p => arePathEquals(p, path));
					}
				}

				return false;
 			}
		)

		if(!viewDeclaration) {
			viewDeclaration = viewsTree.find(vD => vD.default);

			if(viewDeclaration) {
				// Si une vue par défaut à été trouvé, étant donné qu'elle a nécessité un changement de chemin, on change le chemin de l'URL
				pushHistoryState(viewDeclaration)
			}
			else {
				throw new Error("No default view has been provided. Please add the property \"default: true\“ to one of your ViewDeclaration inside your ViewsTree.")
			}
		}

		return viewDeclaration
	}, [session.user, viewsTree])

	/////////////////////////////////////////////////////////////////////////////////////////
	// INITIALISATION
	// Traite les données de l'URL ouverte
	let initialViewDeclaration = defaultViewDeclaration;

	if(!mounted) {
		mounted = true;
		initialViewDeclaration = getViewDeclarationFromPath();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////
	// STATE
	const [state, setState] = useState<{
		path: string | string[];
		params: {[key: string]: string},
		viewDeclaration: ViewDeclaration<CustomUserModel, any>
	}>({
		path: initialPath,
		params: initialParams,
		viewDeclaration: initialViewDeclaration
	})

	////////////////////////////////////////////////////////////////////////////////////:
	// Navigate function
	const navigate = useCallback((path: string, params?: {[key: string]: string}) => {
		path = path || "/";

		let viewDeclaration = getViewDeclarationFromPath(path); // Cherche la vue demandée.

		// La vue requière l'authentification mais l'utilisateur·ice n'est pas connectée
		if(
			(
				viewDeclaration.auth
				|| (viewDeclaration.roles && viewDeclaration.roles.length > 0)
			) && !session.token
		) {
			log.useRouter("NAVIGATE -", path, "- View require being logged in but you aren't.");
			return
		}

		// La vue requière un rôle que l'utilisateur·ice n'a pas
		if(
			viewDeclaration.roles
			&& (
				!session.user
				|| !viewDeclaration.roles.some(role => session.user?.roles.includes(role))
			)
		) {
			log.useRouter("NAVIGATE -", path, "- View require a role you haven't.");
			return
		}

		log.useRouter("NAVIGATE -", path, "- Ok.");

		////////////////////////////////////////////////////////////////////////:
		// Push la nouvelle page dans l'historique du navigateur
		pushHistoryState(viewDeclaration, params)

		// Update le state
		setState({path, params: params || {}, viewDeclaration})
	}, [session.user, viewsTree])

	////////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// Navigate lorsque l'URL change
	useEffect(() => {
		window.onpopstate = () => navigate(
			window.location.pathname || "/",
			getParamsObjectfromURL()
		)
	}, [])

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// Si l'utilisateur est déconnecté et qu'il était sur une vue qui requiert d'être authentifié•e, on retourne à la vue par défaut
	useEffect(() => {
		if(state.viewDeclaration.auth && !session.token) {
			navigate(
				typeof defaultViewDeclaration.path === "string"
					? defaultViewDeclaration.path
					: defaultViewDeclaration.path[0]
			)
		}
		else if(session.user) {
			navigate(initialPath, initialParams);
		}
	}, [session.user])

	////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// TODO : retravailler cette partie. Je ne sais pas comment faire pour conserver la ref.
	// Un useRef rallongerais la longueur du code puisqu'on devrait appeler router.current...
	RouterRef.navigate = navigate;
	RouterRef.params = state.params;
	RouterRef._currentViewDeclaration = state.viewDeclaration;
	RouterRef.path = state.path;

	log.useRouter({...RouterRef});

	log.useRouterGroupEnd("ROUTER", state.path);

	return RouterRef;
}