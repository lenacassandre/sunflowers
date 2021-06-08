import { useState, useRef, useEffect } from "react";

import { SessionSystem } from "../../types";


import Socket from "../../service/socket";


import log from "../../utils/log";
import User from "./classes/user.class";

import { Promise } from '../../classes/Promise';

const SessionRef:any = {}

export default function useSession<UserDocumentClass extends User>(
	socket: Socket,
	UserClass: { new(user: UserDocumentClass): UserDocumentClass }
): SessionSystem<UserDocumentClass> {
	log.useSessionGroup();

	// On conserve le token pour pouvoir vérifier à chaque fois s'il a changé, et n'appeler l'API que dans ce cas
	const [state, setState] = useState<{
		user: UserDocumentClass | null
		token: string | null
	}>({
		user: null,
		token: localStorage.getItem("token") || null
	});

	// Supprime la session enreigistrée ET le token
	function logout() {
		log.useSession("Logout");
		localStorage.clear();
		setState({ user: null, token: null });
	}

	function login(userName: string, password: string): Promise<void, string> {
		log.useSession("Login -", userName);

		return new Promise<void, string>((resolve, reject) => {
			socket.emit<{token: string, user: UserDocumentClass}>("user/login", {userName, password})
				.then((response) => {
					if (!response.token) {
						reject("Signup Erreur : pas de token.");
						return;
					}

					if (!response.user) {
						reject("Signup Erreur : pas d'utilisateur.");
						return;
					}

					localStorage.setItem("token", response.token);
					setState({ token: response.token, user: new UserClass(response.user) });

					setTimeout(resolve);
				})
				.catch(({error}) => {
					reject(error);
				});
		})
	}

	/**
	 * Save a user in the local state without request to the server.
	 * (Usefull if you got the user from a custom controller)
	 * @param user
	 */
	function saveUser(user: UserDocumentClass) {
		log.useSession("Save user -", user);
		setState({...state, user})
	}

	/**
	 * Save a token without request to the server.
	 * (Usefull if you got the token from a custom controller)
	 * @param token
	 */
	function saveToken(token: string) {
		log.useSession("Save token -", token);
		localStorage.setItem("token", token);
		setState({...state, token})
	}

	/**
	 * Save a token and a user without request to the server.
	 * (Usefull if you got the token from a custom controller)
	 * @param token
	 */
	function saveSession(token: string, user: UserDocumentClass) {
		log.useSession("Save session -", token, user);
		localStorage.setItem("token", token);
		setState({user, token})
	}

	///////////////////////////////////////////////////////////////////////////////////////;

	// Lis le token au démarrage de l'app. Demande à le vérifier s'il y en a un.
	useEffect(() => {
		const currentToken = localStorage.getItem("token");

		log.useSession("Bootstrap useEffect token -", currentToken)

		// Fermeture de la session si le token a été supprimé
		if (!currentToken) {
			log.useSession("Bootstrap useEffect token - No token, loging out");
			logout();
		}
		// Un nouveau token a été enregistré dans le localStorage, on demande alors à l'API de vérifier son authenticité
		else {
			log.useSession("Bootstrap useEffect token - Verifying token");

			socket.emit<{user: UserDocumentClass}>("user/verify", {token: currentToken})
				.then((response) => {
					// Token non vérifié : suppression du l'utilisateur et du token enregistré
					if (!response || !response.user) {
						log.useSession("Bootstrap useEffect token - Invalid token");
						logout();
					}
					// Token vérifié : enregistrement de l'utilisateur
					else {
						log.useSession("Bootstrap useEffect token - Valid token.");
						setState({
							...state,
							user: new UserClass({
								...response.user,
							}),
							token: currentToken
						});
					}
				})
				// Token non vérifié : suppression du l'utilisateur et du token enregistré
				.catch((error) => {
					logout();
				});
		}
	}, [])


	const sessionRef = useRef(state);
	sessionRef.current = state;

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	SessionRef.user = state.user;
	SessionRef.token = state.token;
	SessionRef.login = login;
	SessionRef.logout = logout;
	SessionRef.saveUser = saveUser;
	SessionRef.saveToken = saveToken;
	SessionRef.saveSession = saveSession

	log.useSession({...SessionRef});

	log.useSessionGroupEnd(
		`SESSION${
			state.user
				? ` : <${state.user.userName}>`
				: ""
		}`
	);

	return SessionRef;
}
