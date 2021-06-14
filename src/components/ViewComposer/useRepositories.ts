import { useEffect, useState, useCallback, useRef} from "react";
import { SessionSystem, Repositories, RCArguments, RCType, RCReturn, RCError, SocketError } from "../../types";
import log, { response } from "../../utils/log";

import Repository from './classes/repository.class'
import Document from './classes/document.class'
import User from './classes/user.class'
import Socket from "../../service/socket";

import { Promise } from '../../classes/Promise'
import { remove } from "./controllers/remove";
import { post } from "./controllers/post";
import { patch } from "./controllers/patch";
import { restore } from "./controllers/restore";
import { archive } from "./controllers/archive";
import { unarchive } from "./controllers/unarchive";
import { destroy } from "./controllers/destroy";
import { disconnect } from "process";
import { forceDestroy } from "./controllers/forceDestroy";

///////////////////////////////////////////////////////////////////////////////////////////////////////////
export type RepositoryPromise<ReturnType = any, CatchType = void> = {send: () => Promise<ReturnType, CatchType>}

// Renvoie un objet avec la méthode send, qui elle même renvoie une promesse
function repositoryPromise<DocType extends Document, ControllerType extends RCType>(
	sendFunction: (resolve: (values: RCReturn<DocType>[ControllerType]) => void, reject: (error: {error: string, [key: string]: any}) => void ) => void
): RepositoryPromise<RCReturn<DocType>[ControllerType], RCError[ControllerType]> {
    return {
        send: () => new Promise<RCReturn<DocType>[ControllerType], RCError[ControllerType]>((resolve, reject) => {
			sendFunction(resolve, reject);
		})
    }
}

// Renvoie une promesse qui est immédiatement rejetée
function autoRejectRepositoryPromise<DocType extends Document, ControllerType extends RCType>(error: string) {
	return repositoryPromise<DocType, ControllerType>(
		(_resolve, reject) => reject({error})
	)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::://////
// APPLY AND FORWARD FUNCTION

// Forward fait passer l'appel de la méthode du document au repo
function getForwardFunction<ControllerType extends RCType>(
	repositoriesRef: React.MutableRefObject<Repositories>,
	callback: (
		repo: Repository<any, any>,
		data: RCArguments<any>[ControllerType]
	) => RepositoryPromise<RCReturn<any>[ControllerType], RCError[ControllerType]>
) {
	return <RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document>(
		repositoryName: string,
		data: RCArguments<DocType>[ControllerType]
	): RepositoryPromise<RCReturn<DocType>[ControllerType], RCError[ControllerType]> => {
		const repositoryToCall: RepositoryType = repositoriesRef.current[repositoryName] as RepositoryType;

		if(!repositoryToCall) return autoRejectRepositoryPromise<DocType, ControllerType>(`Le repository ${repositoryName} est introuvable.`);

		return callback(repositoryToCall, data); // Le repository va retourner une repositoryPromise qui permettra d'appeler .send()
	}
}

// DEFAULT ///////////////////////////////////////////////////////:

// Forward
// Renvoie une fonction forward qui sera là le temps qu'elle soit réellement initialisée par la hook
function getDefaultForwardFunction<ControllerType extends RCType>(controllerType: ControllerType) {
	return <DocType extends Document>(repositoryName: string, _data: RCArguments<DocType>[ControllerType]) => {
		return autoRejectRepositoryPromise<DocType, ControllerType>(`useRepositoryCallbacks.forward${controllerType}(${repositoryName}) n'a pas encore été initialisée.`);
	}
}

// Apply
// Renvoie une fonction apply qui sera là le temps qu'elle soit réellement initialisée par la hook
function getDefaultApplyFunction<ControllerType extends RCType>(controllerType: ControllerType) {
	return <RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document>(repositoryName: string, _socketData: RCArguments<DocType>[ControllerType]) => {
		return autoRejectRepositoryPromise<DocType, ControllerType>(`useRepositoryCallbacks.apply${controllerType}(${repositoryName}) n'a pas encore été initialisée.`);
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////::
// Cette ref permet aux classes Repository de rappler la hook useRepository via useRepositoryCallback.call
// ou aux classes Document d'appeler useRepository puis leur classe Repository via forwardPatch/forwardRemove.
export const useRepositoryCallbacks = {
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Les apply font passer l'appel du repo à la hook useRepos
	applyPost: getDefaultApplyFunction<"post">("post"),
	applyPatch: getDefaultApplyFunction<"patch">("patch"),
	applyRemove: getDefaultApplyFunction<"remove">("remove"),
	applyRestore: getDefaultApplyFunction<"restore">("restore"),
	applyDestroy: getDefaultApplyFunction<"destroy">("destroy"),
	applyForceDestroy: getDefaultApplyFunction<"forceDestroy">("forceDestroy"),
	applyArchive: getDefaultApplyFunction<"archive">("archive"),
	applyUnarchive: getDefaultApplyFunction<"unarchive">("unarchive"),
	applyGetAll: getDefaultApplyFunction<"getAll">("getAll"),
	applyGetArchives: getDefaultApplyFunction<"getArchives">("getArchives"),
	applyGetRemoved: getDefaultApplyFunction<"getRemoved">("getRemoved"),
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Les forwards font passés l'appel d'un document au repo
	forwardPatch: getDefaultForwardFunction<"patch">("patch"),
	forwardRemove: getDefaultForwardFunction<"remove">("remove"),
	forwardRestore: getDefaultForwardFunction<"restore">("restore"),
	forwardDestroy: getDefaultForwardFunction<"destroy">("destroy"),
	forwardForceDestroy: getDefaultForwardFunction<"forceDestroy">("forceDestroy"),
	forwardArchive: getDefaultForwardFunction<"archive">("archive"),
	forwardUnarchive: getDefaultForwardFunction<"unarchive">("unarchive"),
}

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
// HOOK useRepositories

// #Region test #ffffff

/**
 * useRepositories est la "Hook" React qui permet d'avoir toutes les informations
 * dont l'utilisateur a besoin directement sur le client. La Hook les maintien à jour
 * en cas de changement distant, et envoie les modifications du client au serveur.
 *
 * @argument models : Un objet contenant tous les modèles utilisés par l'app
 * @argument method : Le méthode de la repository a appeler (pour la requête au serveur).
 */
export default function useRepositories<UserType extends User>(socket: Socket, emptyRepositories: Repositories, session: SessionSystem<UserType>) {
	log.useRepositoriesGroup();

	// Un state object contenant tous les repos.
	const [repositories, setRepositories] = useState<Repositories>(emptyRepositories);
	const repositoriesRef = useRef(repositories);
	repositoriesRef.current = repositories;

	log.useRepositories("repositories (state)");

	// Log du nombre de document dans chaque repo à chaque appel de la Hook
	for(let repositoryName in repositoriesRef.current) {
		log.useRepositories(repositoryName, repositoriesRef.current[repositoryName].length, repositoriesRef.current[repositoryName].loaded ? "✅" : "⭕️")
	}

	// Les forwards methods permettent de faire passer l'appel de la méthode d'un document à son repo.
	const forwardPatch = useCallback(getForwardFunction<"patch">(repositoriesRef, (repo, data) => repo.patch(data)), []);
	const forwardRemove = useCallback(getForwardFunction<"remove">(repositoriesRef, (repo, data) => repo.remove(data)), []);
	const forwardRestore = useCallback(getForwardFunction<"restore">(repositoriesRef, (repo, data) => repo.restore(data)), []);
	const forwardDestroy = useCallback(getForwardFunction<"destroy">(repositoriesRef, (repo, data) => repo.destroy(data)), []);
	const forwardForceDestroy = useCallback(getForwardFunction<"forceDestroy">(repositoriesRef, (repo, data) => repo.forceDestroy(data)), []);
	const forwardArchive = useCallback(getForwardFunction<"archive">(repositoriesRef, (repo, data) => repo.archive(data)), []);
	const forwardUnarchive = useCallback(getForwardFunction<"unarchive">(repositoriesRef, (repo, data) => repo.unarchive(data)), []);

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/**
	 * @argument repositoryName Nom du repo (clé du repo dans le state object repositories (ex: "user"))
	 * @argument newRepositoryInstance
	 */
	const applyChanges = useCallback(<RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document, ControllerType extends RCType>(
		repositoryName: string,
		newRepositoryInstance: RepositoryType,
		callback: (
			reapplyChanges: (newerRepositoryInstance: RepositoryType, resolveValues: RCReturn<DocType>[ControllerType]) => void,
			cancelChanges: (error: {error: string, [key: string]: any}) => void,
			oldRepositoryInstance: RepositoryType
		) => void,
	): RepositoryPromise<RCReturn<DocType>[ControllerType], RCError[ControllerType]> => {
		const oldRepositoryInstance: RepositoryType = repositoriesRef.current[repositoryName] as RepositoryType; // L'état actuel de la repository a changer.

		if(!oldRepositoryInstance) return autoRejectRepositoryPromise<DocType, ControllerType>(`La repository ${repositoryName} n'existe pas.`);

		setRepositories({ // Mise à jour immédiate des repositories côté client. La mise à jour sera annulée en cas d'erreur.
			...repositoriesRef.current,
			[repositoryName]: newRepositoryInstance
		})

		return repositoryPromise<DocType, ControllerType>((resolve, reject) => { // La repositoryPromise permet d'envoyer la requête au serveur en appelant .send(). C'est facultatif, on peut très bien ne pas l'appeler et conserver les changement uniquement localement.
			const cancelChanges = (error: {error: string, [key: string]: any}) => { // Cette fonction sera appellée en cas d'erreur, pour rétablir l'ancien état des repositories
				setRepositories({ // Mise à jour immédiate des repositories côté client. La mise à jour sera annulée en cas d'erreur.
					...repositoriesRef.current,
					[repositoryName]: oldRepositoryInstance
				});

				reject(error);
			}

			const reApplyChanges = (newerRepositoryInstance: RepositoryType, resolveValues: RCReturn<DocType>[ControllerType]) => {
				setRepositories({ // Mise à jour immédiate des repositories côté client. La mise à jour sera annulée en cas d'erreur.
					...repositoriesRef.current,
					[repositoryName]: newerRepositoryInstance
				});

				resolve(resolveValues)
			}

			callback(reApplyChanges, cancelChanges, oldRepositoryInstance);
		})
	}, [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * getApplyFunction est une abstraction des étapes communes à tous les controlleurs clients
	 * Elle permet d'obtenir une fonction qui sera appelée par un repository pour impacter les données conservées dans hook,
	 * Tout en faisant l'appel au serveur, et gérer sa réponse positive ou négative.
	 */
	const getApplyFunction = useCallback(<ControllerType extends RCType>(
		controllerType: ControllerType,
		getNewRepoInstance: <RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document>(repository: Repository<any, any>, requestData: RCArguments<DocType>[ControllerType]) => RepositoryType,
		requestResolved: <RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document>(
			reapplyChanges: (newerRepositoryInstance: RepositoryType, resolveValues: RCReturn<DocType>[ControllerType]) => void,
			cancelChanges: (reason: {error: string, [key: string]: any}) => void,
			oldRepositoryInstance: RepositoryType,
			currentRepositoryInstance: RepositoryType,
			requestData: RCArguments<DocType>[ControllerType],
			respondeData: RCReturn<DocType>[ControllerType]
		) => void,
		requestRejected?: (error: {error: string, [key: string]: any}) => void
	) => {
		return <RepositoryType extends Repository<RepositoryType, DocType>, DocType extends Document>(
			repositoryName: string,
			requestData: RCArguments<DocType>[ControllerType]
		) => {
			// Trouve le repo
			const oldRepositoryInstance = repositoriesRef.current[repositoryName] as RepositoryType;

			// Erreur si le repo n'est pas trouvé, la promesse est automatiquement rejetée.
			if(!oldRepositoryInstance) return autoRejectRepositoryPromise<DocType, ControllerType>(`La repository ${repositoryName} est introuvable.`);

			// On demande une nouvelle instance du repo, sauvegardé en fonction de la méthode appelée, afin de le remplacer immédiatement, avec même de proposer d'envoyer la requête au serveur.
			const newRepositoryInstance = getNewRepoInstance<RepositoryType, DocType>(oldRepositoryInstance, requestData)

			// On applique immédiatement les changement localement, et on propose de les envoyer au serveur.
			return applyChanges<RepositoryType, DocType, ControllerType>(repositoryName, newRepositoryInstance, (reapplyChanges, cancelChanges) => {
				socket.emit<RCReturn<DocType>[ControllerType]>(`${repositoryName}/${controllerType}`, requestData)
					.then((responseData) => {
						// Trouve le repo
						const currentRepositoryInstance = repositoriesRef.current[repositoryName] as RepositoryType;

						// Erreur si le repo n'est pas trouvé, la promesse est automatiquement rejetée.
						if(!currentRepositoryInstance) return autoRejectRepositoryPromise<DocType, ControllerType>(`La repository ${repositoryName} est introuvable.`);

						// La requête au serveur a été acceptée,
						requestResolved<RepositoryType, DocType>(reapplyChanges, cancelChanges, oldRepositoryInstance, currentRepositoryInstance, requestData, responseData)
					})
					.catch((e) => {
						if(requestRejected) {
							requestRejected(e)
						}

						cancelChanges(e); // La requête a été refusée. On rétablie l'ancienne instance de la repository.
					});
			})
		}
	}, [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply post
	const applyPost = useCallback(getApplyFunction<"post">(
		"post",
		post,
		(reapplyChanges, _cancelChanges, oldRepo, currentRepo, requestData, responseData) => {
			// Les documents qui avaient été envoyés mais ne sont pas dans la réponse.
			const refusedDocs = requestData
				.filter((doc) =>
					!responseData.some(acceptedDoc => doc._id === acceptedDoc._oldId)
				)

			// On retire les documents qui ont été refusés à partir de l'instance actuelle du repo
			// et on remplace les id temporaire par ceux envoyés par le serveur
			const newerRepositoryInstance = currentRepo.set(
				currentRepo
					.filter((doc) => !refusedDocs.some((d) => d._id === doc._id))
					// doc = document du repo actuel
					.map(doc => {
						// Document tel qu'il a été ajouté par le client au début
						const oldDoc = requestData.find(d => d._id === doc._id);

						// responseDoc = document renvoyé par le serveur une fois accepté
						const responseDoc = responseData.find(d => d._oldId === doc._id)

						// Changement de l'_id
						if(responseDoc) {
							doc._id = responseDoc._id;

							///////////////////////////////////////////////////////////////////////////////:
							// Modifie sur le client toutes les propriétés du document qui ont été sauvegardées par le serveur (fonctionne pour l'instant uniquement pour les primaires)
							for(let key in responseDoc) {
								const responseDocKey = key as keyof typeof responseDoc;

								// La propriété de ne pas être une date, une fonction, un objet, ou un symbole
								// Si la valeur de la propriété renvoyée par le serveur est différente du document d'origine, c'est la valeur envoyé par le serveur qui prime.
								if(
									//@ts-ignore
									!(doc[responseDocKey] instanceof Date)
									&& !(
										typeof responseDoc[responseDocKey] === "function" ||
										typeof responseDoc[responseDocKey] === "object" ||
										typeof responseDoc[responseDocKey] === "symbol"
									)
									// @ts-ignore
									&& oldDoc[responseDocKey] !== responseDoc[responseDocKey]
								) {
									//@ts-ignore
									doc[responseDocKey] = responseDoc[responseDocKey]
								}
							}
							/////////////////////////////////////////////////////////////////////////
						}

						return doc
					})
			)

			reapplyChanges(newerRepositoryInstance, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply patch
	// TODO : mieux faire le tri sur les patch qui ont été refusés ou non.
	const applyPatch = useCallback(getApplyFunction<"patch">(
		"patch",
		patch,
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply remove
	// TODO: mieux faire le tri sur les remove qui sont refusés
	// Retire les documents du tableau du répo et les met à la corbeille
	const applyRemove = useCallback(getApplyFunction<"remove">(
		"remove",
		remove,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply restore
	// Retire les documents de la corbeille et les rajoute au tableau du repo
	const applyRestore = useCallback(getApplyFunction<"restore">(
		"restore",
		restore,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply destroy
	const applyDestroy = useCallback(getApplyFunction<"destroy">(
		"destroy",
		destroy,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply force destroy
	const applyForceDestroy = useCallback(getApplyFunction<"forceDestroy">(
		"forceDestroy",
		forceDestroy,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply archive
	const applyArchive = useCallback(getApplyFunction<"archive">(
		"archive",
		archive,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply unarchive
	const applyUnarchive = useCallback(getApplyFunction<"unarchive">(
		"unarchive",
		unarchive,
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			reapplyChanges(currentRepo, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply getAll
	const applyGetAll = useCallback(getApplyFunction<"getAll">(
		"getAll",
		(repo) => {
			const newRepoInstance = repo.clone();
			return newRepoInstance;
		},
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			//@ts-ignore 😩
			const newestInstance = currentRepo.set(responseData);
			reapplyChanges(newestInstance, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply getArchives
	const applyGetArchives = useCallback(getApplyFunction<"getArchives">(
		"getArchives",
		(repo) => {
			const newRepoInstance = repo.clone();
			return newRepoInstance;
		},
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			//@ts-ignore
			const newestRepoInstance = currentRepo.setArchives(responseData)
			reapplyChanges(newestRepoInstance, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	// Apply getRemoved
	const applyGetRemoved = useCallback(getApplyFunction<"getRemoved">(
		"getRemoved",
		(repo) => {
			const newRepoInstance = repo.clone();
			return newRepoInstance;
		},
		//@ts-ignore je sais pas d'où vient ce bug
		(reapplyChanges, _cancelChanges, _oldRepo, currentRepo, _requestData, responseData) => {
			//@ts-ignore
			const newestRepoInstance = currentRepo.setRemoved(responseData);
			reapplyChanges(newestRepoInstance, responseData);
		}
	), [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	// REMOTE CHANGES //////////////////////////////////////////////////////////////////////////////////

	useEffect(<RCT extends RCType>() => {
		socket.on<{
			author: UserType | null,
			date: Date,
			repositoryName: string;
			controllerType: RCT;
			data: RCArguments<any>[RCT],
		}>("remoteChanges", (remoteChange) => {
			try {
				log.useRepositories("remoteChanges", remoteChange)

				const repository = repositoriesRef.current[remoteChange.repositoryName];

				if(!repository) {
					log.useRepositories(`remoteChanges error, can't find ${remoteChange.repositoryName} repository.`)
					return;
				}

				if(!remoteChange.data) {
					log.useRepositories(`remoteChanges error, no data.`)
					return;
				}

				switch(remoteChange.controllerType) {
					case "post": { // Un post a été fait par quelqu'un d'autre, on update les donneés locales.
						// On évite d'ajouter des documents qui sont déjà là
						let data = remoteChange.data as RCArguments<any>["post"]
						data = data.filter(doc => !repository.some(d => d._id === doc._id))

						const newerRepositoryInstance = post(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "patch": { // Un patch a été fait par quelqu'un d'autre, on update les données locales
						const data = remoteChange.data as RCArguments<any>["patch"]
						const newerRepositoryInstance = patch(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "remove": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["remove"]
						const newerRepositoryInstance = remove(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "restore": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["restore"]
						const newerRepositoryInstance = restore(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "destroy": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["destroy"]
						const newerRepositoryInstance = destroy(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "forceDestroy": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["forceDestroy"]
						const newerRepositoryInstance = forceDestroy(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "archive": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["archive"]
						const newerRepositoryInstance = archive(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}

					case "unarchive": { // Un remove a fait par quelqu'un d'autre, on update les données locales.
						const data = remoteChange.data as RCArguments<any>["unarchive"]
						const newerRepositoryInstance = unarchive(repository, data)

						setRepositories({
							...repositoriesRef.current,
							[remoteChange.repositoryName] : newerRepositoryInstance
						})

						break;
					}
				}
			}
			catch(e) {
				console.error(e)
			}
		})
	}, [])

	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////

	// À chaque changement de token, on recharge les repositories
	useEffect(() => {
		log.useRepositories("use effect session.user", session.token, session.user)

		if(session.token && session.user) {
			log.useRepositories("LOADING REPO", repositoriesRef.current)

			for(let repoName in repositoriesRef.current) {
				repositoriesRef.current[repoName].getAll().send()
					.then(() => {})
					.catch(() => {})
			}
		}
	}, [session.user]);

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Mise à jour des fonctions de lien avec les classes Document et Repository
	useEffect(() => {
		useRepositoryCallbacks.forwardPatch = forwardPatch;
		useRepositoryCallbacks.forwardRemove = forwardRemove;
		useRepositoryCallbacks.forwardRestore = forwardRestore;
		useRepositoryCallbacks.forwardDestroy = forwardDestroy;
		useRepositoryCallbacks.forwardForceDestroy = forwardForceDestroy;
		useRepositoryCallbacks.forwardArchive = forwardArchive;
		useRepositoryCallbacks.forwardUnarchive = forwardUnarchive;

		useRepositoryCallbacks.applyPost = applyPost;
		useRepositoryCallbacks.applyPatch = applyPatch;
		useRepositoryCallbacks.applyRemove = applyRemove;
		useRepositoryCallbacks.applyRestore = applyRestore;
		useRepositoryCallbacks.applyDestroy = applyDestroy;
		useRepositoryCallbacks.applyForceDestroy = applyForceDestroy;
		useRepositoryCallbacks.applyArchive = applyArchive;
		useRepositoryCallbacks.applyUnarchive = applyUnarchive;
		useRepositoryCallbacks.applyGetAll = applyGetAll;
		useRepositoryCallbacks.applyGetArchives = applyGetArchives;
		useRepositoryCallbacks.applyGetRemoved = applyGetRemoved;
	}, [])

	log.useRepositoriesGroupEnd("REPOSITORIES");

	return repositoriesRef;
}