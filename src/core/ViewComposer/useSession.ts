import { useState, useRef, useEffect } from "react";

import { SessionSystem } from "../../types";


import Socket from "../../service/socket";


import log from "../../utils/log";
import User from "../../classes/user.class";

import { Promise } from 'true-promise';

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
		organization: string | null
	}>({
		user: null,
		token: localStorage.getItem("token") || null,
		organization: null
	});

	/**
	 * Supprime la session enreigistrée ET le token
	 */
	function logout() {
		log.useSession("Logout");
		localStorage.clear();
		setState({ user: null, token: null, organization: null });
		socket.emit<void>("connection/logout")
	}

	/**
	 * TODO: doc
	 * @param userName
	 * @param password
	 * @returns
	 */
	function login(userName: string, password: string): Promise<void, {error: string}> {
		log.useSession("Login -", userName);

		return new Promise<void, {error: string}>((resolve, reject) => {
			if(!userName) {
				reject({error: "Veuillez saisir votre adresse e-mail."});
				return;
			}

			if(!password) {
				reject({error: "Veuillez saisir votre mot de passe."});
				return;
			}

			socket.emit<{token: string, user: UserDocumentClass, organization: string}>("connection/login", {userName, password})
				.then((response) => {
					if (!response.token) {
						reject({error: "Login Erreur : pas de token."});
						return;
					}

					if (!response.user) {
						reject({error: "Login Erreur : pas d'utilisateur."});
						return;
					}

					localStorage.setItem("token", response.token);
					setState({ token: response.token, user: new UserClass(response.user), organization: response.organization });

					setTimeout(resolve);
				})
				.catch((response) => {
					reject(response);
				});
		})
	}

	/**
	 * Link the session to another organization of the user
	 * @param organizationId
	 */
	function switchOrganization(organizationId: string) {
		log.useSession("switchOrganization", organizationId);

		if (sessionRef.current?.user?.organizations.includes(organizationId)) {
			socket.emit("connection/switchOrganization", organizationId)
				.then(() => {
					setState({...state, organization: organizationId})
				})
		}
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
	 * Save an organization id without request to the server.
	 * (Usefull if you got the token from a custom controller)
	 * @param organizationId
	 */
	function saveOrganization(organizationId: string) {
		log.useSession("Save organizationId -", organizationId);-
		setState({...state, organization: organizationId})
	}

	/**
	 * Save a token and a user without request to the server.
	 * (Usefull if you got the token from a custom controller)
	 * @param token
	 */
	function saveSession(token: string, user: UserDocumentClass, organization: string) {
		log.useSession("Save session -", token, user);
		localStorage.setItem("token", token);
		setState({user, token, organization})
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

			const checkToken = () => socket.emit<{user: UserDocumentClass}>("connection/verify", {token: currentToken})
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
					if(error.error.includes("timed out")) {
						setTimeout(checkToken, 5000);
					} else {
						logout();
					}
				});

			checkToken();
		}
	}, [])


	const sessionRef = useRef(state);
	sessionRef.current = state;

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	SessionRef.user = state.user;
	SessionRef.token = state.token;
	SessionRef.login = login;
	SessionRef.logout = logout;
	SessionRef.switchOrganization = switchOrganization;
	SessionRef.saveUser = saveUser;
	SessionRef.saveToken = saveToken;
	SessionRef.saveOrganization = saveOrganization;
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
