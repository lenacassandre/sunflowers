import { useEffect, useState, useCallback, useRef} from "react";
import { SessionSystem, Factories } from "../../types";
import log from "../../utils/log";
import timeoutPromise from "../../utils/timeoutPromise";

import Factory from './classes/factory.class'
import Document from './classes/document.class'
import User from './classes/user.class'
import Socket from "../../service/socket";

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

type FactoryMethods = "post" | "patch" | "delete";

// Les types de réponse que peut renvoyer le serveur
export type PostResponse<DocType> = (Partial<DocType> & {_id: string, _oldId: string})[];
export type PatchResponse<DocType> = (Partial<DocType> & {_id: string})[];
export type DeleteResponse = string[];

/////////////////////////////////////////////////////////////////////////////////////////////////////:
/////////////////////////////////////////////////////////////////////////////////////////////////////:
/////////////////////////////////////////////////////////////////////////////////////////////////////:
/////////////////////////////////////////////////////////////////////////////////////////////////////:
/////////////////////////////////////////////////////////////////////////////////////////////////////:
function loadFactories(socket: Socket, factories: Factories): Promise<Factories> {
	return new Promise((resolve, reject) => {
		const getAllPromises: Promise<any>[] = [];

		for(const factoryName in factories) { // On stock toutes les requêtes dans un tableau
			getAllPromises.push(
				socket.emit(`${factoryName}/getAll`)
			)
		}

		Promise.all(getAllPromises) // Toutes les requêtes doivent être acceptées
			.then((factoriesArray) => {
				if(factoriesArray.every(fa => Array.isArray(fa))) { // Le résultat doit être un tableau des tableaux des documents.
					const newFactoriesObject: {[factoryName: string]: Factory<any, any>} = {}

					let i = 0;
					for(const factoryName in factories) { // Pour toutes les factories demandées par la hook.
						newFactoriesObject[factoryName] = factories[factoryName].set(factoriesArray[i]); // On recré toutes les factory en les réinitialisant avec les données
						newFactoriesObject[factoryName].loaded = true;
						i++;
					}

					resolve(newFactoriesObject)
				}
				else {
					reject(); // Le getAll n'a pas fonctionné.
				}
			})
			.catch((errors) => { // Une ou plusieurs reuqêtes ont été refusées.
				console.log("fail", errors)
				reject()
			})
	})
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
export type FactoryPromise<ReturnType = any> = {send: () => Promise<ReturnType>}

function factoryPromise<ReturnType = any>(
	sendFunction: (resolve: (values: ReturnType) => void, reject: (error: {error: string, [key: string]: any}) => void ) => void
): FactoryPromise<ReturnType> {
    return {
        send: () => new Promise((resolve, reject) => {
			sendFunction(resolve, reject);
		})
    }
}

function autoRejectFactoryPromise(error: string) {
	return factoryPromise(
		(_resolve, reject) => reject({error})
	)

}

// Cette ref permet aux classes Factory de rappler la hook useFactory via useFactoryCallback.call
// ou aux classes Document d'appeler useFactory puis leur classe Factory via forwardPatch/forwardDelete.
export const useFactoryCallbacks = {
	applyPost: <FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(factoryName: string, _socketData: {docs: DocType[]}): FactoryPromise<PostResponse<DocType>> => {
		return autoRejectFactoryPromise(`useFactoryCallbacks.applyPost(${factoryName}) n'a pas encore été initialisée.`);
	},
	applyPatch: <FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(factoryName: string, _socketData: {patches: (Partial<DocType> & {_id: string})[]}): FactoryPromise<PatchResponse<DocType>> => {
		return autoRejectFactoryPromise(`useFactoryCallbacks.applyPatch(${factoryName}) n'a pas encore été initialisée.`);
	},
	applyDelete: <FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(factoryName: string, _socketData: {ids: string[], cascade?: boolean}): FactoryPromise<DeleteResponse> => {
		return autoRejectFactoryPromise(`useFactoryCallbacks.applyDelete(${factoryName}) n'a pas encore été initialisée.`);
	},
	forwardPatch: <DocType extends Document>(factoryName: string, _data: (Partial<DocType> & {_id: string})[]) => {
		return autoRejectFactoryPromise(`useFactoryCallbacks.forwardPatch(${factoryName}) n'a pas encore été initialisée.`);
	},
	forwardDelete: <_DocType extends Document>(factoryName: string, _data: string[]) => {
		return autoRejectFactoryPromise(`useFactoryCallbacks.forwardDelete(${factoryName}) n'a pas encore été initialisée.`);
	}
}

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
// HOOK useFactories

/**
 * useFactories est la "Hook" React qui permet d'avoir toutes les informations
 * dont l'utilisateur a besoin directement sur le client. La Hook les maintien à jour
 * en cas de changement distant, et envoie les modifications du client au serveur.
 *
 * @argument models : Un objet contenant tous les modèles utilisés par l'app
 * @argument method : Le méthode de la factory a appeler (pour la requête au serveur).
 */
export default function useFactories<UserType extends User>(socket: Socket, emptyFactories: Factories, session: SessionSystem<UserType>) {
	log.useFactoriesGroup();

	// Un object contenant toutes les tables.
	const [factories, setFactories] = useState<Factories>(emptyFactories);
	const factoriesRef = useRef(factories);
	factoriesRef.current = factories;

	log.useFactories("factories (state)");

	for(let factoryName in factoriesRef.current) {
		log.useFactories(factoryName, factoriesRef.current[factoryName].length)
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// Envoie le patch d'un document à sa factory
	const forwardPatch = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(
		factoryName: string,
		data: (Partial<DocType> & {_id: string})[]
	): FactoryPromise<PatchResponse<DocType>>  => {
		const factoryToCall: FactoryType = factoriesRef.current[factoryName] as FactoryType;

		if(factoryToCall) {
			return factoryToCall.patch(data); // La factory va retourner une factoryPromise qui permettra d'appeler .send()
		} else {
			return autoRejectFactoryPromise(`La factory ${factoryName} est introuvable.`); // Factory introuvable. On envoit quand même une factoryPromise afin de na pas casser le chaining, mais la promesse de .send() sera automatiquement rejetée.
		}
	}, []);

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Envoie le delete d'un document à sa factory
	const forwardDelete = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(
		factoryName: string,
		data: string[]
	): FactoryPromise<DeleteResponse> => {
		const factoryToCall: FactoryType = factoriesRef.current[factoryName] as FactoryType;

		if(factoryToCall) {
			return factoryToCall.delete(data); // La factory va retourner une factoryPromise qui permettra d'appeler .send()
		} else {
			return autoRejectFactoryPromise(`La factory ${factoryName} est introuvable.`); // Factory introuvable. On envoit quand même une factoryPromise afin de na pas casser le chaining, mais la promesse de .send() sera automatiquement rejetée.
		}
	}, []);

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Fonction wrapper générique pour appliquer les changement des factories.
	// Appelée par applyPost, applyPatch et applyDelete.
	const applyChanges = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document, ResolveValues>(
		factoryName: string,
		newFactoryInstance: FactoryType,
		callback: (
			reapplyChanges: (newerFactoryInstance: FactoryType, resolveValues: ResolveValues) => void,
			cancelChanges: (error: {error: string, [key: string]: any}) => void,
			oldFactoryInstance: FactoryType
		) => void,
	) => {
		const oldFactoryInstance: FactoryType = factoriesRef.current[factoryName] as FactoryType; // L'état actuel de la factory a changer.

		if(!oldFactoryInstance) return autoRejectFactoryPromise(`La factory ${factoryName} n'existe pas.`);

		setFactories({ // Mise à jour immédiate des factories côté client. La mise à jour sera annulée en cas d'erreur.
			...factoriesRef.current,
			[factoryName]: newFactoryInstance
		})


		return factoryPromise<ResolveValues>((resolve, reject) => { // La facotryPromise permet d'envoyer la requête au serveur en appelant .send(). C'est facultatif, on peut très bien ne pas l'appeler et conserver les changement uniquement localement.
			const cancelChanges = (error: {error: string, [key: string]: any}) => { // Cette fonction sera appellée en cas d'erreur, pour rétablir l'ancien état des factories
				setFactories({ // Mise à jour immédiate des factories côté client. La mise à jour sera annulée en cas d'erreur.
					...factoriesRef.current,
					[factoryName]: oldFactoryInstance
				});

				reject(error);
			}

			const reApplyChanges = (newerFactoryInstance: FactoryType, resolveValues: ResolveValues) => {
				setFactories({ // Mise à jour immédiate des factories côté client. La mise à jour sera annulée en cas d'erreur.
					...factoriesRef.current,
					[factoryName]: newerFactoryInstance
				});

				resolve(resolveValues)
			}

			callback(reApplyChanges, cancelChanges, oldFactoryInstance);
		})
	}, [])

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// Appelée par une factory pour mettre à jour le state. Renvoie un objet qui permet de transmettre les changements au serveur.
	const applyPost = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(
		factoryName: string,
		socketRequestData: { docs: DocType[] },
	): FactoryPromise<PostResponse<DocType>> => {
		const currentFactoryInstance = factoriesRef.current[factoryName];

		if(!currentFactoryInstance) return autoRejectFactoryPromise(`La factory ${factoryName} est introuvable.`);

		const newFactoryInstance = currentFactoryInstance.set([...currentFactoryInstance, ...socketRequestData.docs]);

		return applyChanges<FactoryType, DocType, PostResponse<DocType>>(factoryName, newFactoryInstance, (reApplyChanges, cancelChanges) => {
			socket.emit<{docs: PostResponse<DocType>}>(`${factoryName}/post`, socketRequestData)
				.then((response) => {
					const refusedDocs = socketRequestData.docs // Les documents qui avaient été envoyés mais ne sont pas dans la réponse.
						.filter((doc: DocType) =>
							!response.docs.some(acceptedDoc => doc._id === acceptedDoc._oldId)
						)

					const newerFactoryInstance: FactoryType = factoriesRef.current[factoryName].set(factoriesRef.current[factoryName]
						.filter((doc: DocType) => !refusedDocs.some((d: DocType) => d._id === doc._id))
						.map((doc: DocType) => {
							const newDocVersion = response.docs.find(d => d._oldId === doc._id); // Un document de la factory qui fait partie des nouveaux

							if(newDocVersion) { // On remplace l'ancienne version des document par la nouvelle.
								return newDocVersion;
							}
							else {
								return doc;
							}
						}))

					reApplyChanges(newerFactoryInstance, response.docs); // On envoie la réponse du sereur au dev, ça peut servir.
				})
				.catch(() => {
					cancelChanges({error: "Refusé."}); // La requête a été refusée. On rétablie l'ancienne instance de la factory.
				});
		})
	}, [])

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// Appelée par une factory pour mettre à jour le state. Renvoie un objet qui permet de transmettre les changements au serveur.
	const applyPatch = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(
		factoryName: string,
		socketRequestData: { patches: (Partial<DocType> & { _id: string })[] },
	): FactoryPromise<PatchResponse<DocType>> => {
		const currentFactoryInstance = factoriesRef.current[factoryName]; // Current instance of the factory to patch

		if(!currentFactoryInstance) return autoRejectFactoryPromise(`La factory ${factoryName} est introuvable.`); // Reject the request if we cant find the factory

		const newFactoryInstance = currentFactoryInstance.clone(); // Clone the current instance

		// For each document to patch
		socketRequestData.patches.forEach(patch => {
			if(patch._id) {
				const docIndex = newFactoryInstance.findIndex((doc: Document) => doc._id === patch._id);

				if(docIndex >= 0) {
					// For each property to patch in the document
					for(const patchKey in patch) {
						const key = patchKey as keyof typeof patch;
						newFactoryInstance[docIndex][key] = patch[key];
					}
				}
			}
		})

		return applyChanges<FactoryType, DocType, PatchResponse<DocType>>(factoryName, newFactoryInstance, (reApplyChanges, cancelChanges, oldFactoryInstance) => {
			socket.emit<{patches: PatchResponse<DocType>}>(`${factoryName}/patch`, socketRequestData)
				.then((response) => {
					// Les documents qui avaient été envoyés mais ne sont pas dans la réponse.
					const refusedPatches: (Partial<DocType> & {_id: string})[] = socketRequestData.patches
						.filter((doc) =>
							!response.patches.some(acceptedPatches => doc._id === acceptedPatches._id)
						)

					// On conserve l'instance actuelle de la factoy mais on rétabli les changements qui ont été refusé par le serveur.
					const newerFactoryInstance = factoriesRef.current[factoryName].set(factoriesRef.current[factoryName].map((doc: DocType) => {
						const refusedPatch = refusedPatches.find(d => d._id === doc._id);

						if(refusedPatch) { // Les changements de ce document ont été refusés. On rétabli l'ancienne version.
							const oldDoc = oldFactoryInstance.find(d => d._id === refusedPatch._id)
							return oldDoc;
						}
						else {
							return doc;
						}
					}))

					reApplyChanges(newerFactoryInstance, response.patches); // On envoie la réponse du sereur au dev, ça peut servir.
				})
				.catch(() => {
					cancelChanges({error: "Refusé."}); // La requête a été refusée. On rétablie l'ancienne instance de la factory.
				});
		})
	}, [])

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////:
	// Appelée par une factory pour mettre à jour le state. Renvoie un objet qui permet de transmettre les changements au serveur.
	const applyDelete = useCallback(<FactoryType extends Factory<FactoryType, DocType>, DocType extends Document>(
		factoryName: string,
		socketRequestData: {ids: string[], cascade?: boolean},
	): FactoryPromise<DeleteResponse> => {
		const currentFactoryInstance = factoriesRef.current[factoryName];

		if(!currentFactoryInstance) return autoRejectFactoryPromise(`La factory ${factoryName} est introuvable.`);

		const newFactoryInstance = currentFactoryInstance.set(
			currentFactoryInstance.filter(
				doc => !socketRequestData.ids.includes(doc._id)
			)
		);

		return applyChanges<FactoryType, DocType, DeleteResponse>(factoryName, newFactoryInstance, (reApplyChanges, cancelChanges, oldFactoryInstance) => {
			socket.emit<{ids: DeleteResponse}>(`${factoryName}/delete`, socketRequestData)
				.then((response) => {

					const newerFactoryInstance =  factoriesRef.current[factoryName].set(oldFactoryInstance.filter((doc) => {
						return !response.ids.includes(doc._id)
					}))

					reApplyChanges(newerFactoryInstance, response.ids); // On envoie la réponse du sereur au dev, ça peut servir.
				})
				.catch(() => {
					cancelChanges({error: "Refusé."}); // La requête a été refusée. On rétablie l'ancienne instance de la factory.
				});
		})
	}, [])

	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	// À chaque changement de token, on recharge les factories
	useEffect(() => {
		if(session.token && session.user) {
			loadFactories(socket, factories)
				.then(newFactories => {
					setFactories(newFactories)
				})
				.catch(error => {
					console.error('Erreur lors du chargement des factories', error)
				})
		}
	}, [session.user])

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Listen to remote changes
	useEffect(() => {
		socket.on<{
			author: UserType | null,
			date: Date,
			factoryName: string;
			type: "post" | "patch" | "delete";
			data: string[] | (Partial<any & Document> & {_id: string})[] | (Document & any)[],
		}>("remoteChanges", (remoteChange) => {
			try {
				log.useFactories("remoteChanges", remoteChange)

				const factory = factoriesRef.current[remoteChange.factoryName];

				if(!factory) {
					console.log(`remoteChanges error, can't find ${remoteChange.factoryName} factory.`)
					return;
				}

				switch(remoteChange.type) {
					case "post": { // Un post a été fait par quelqu'un d'autre, on update les donneés locales.
						// On évite d'ajouter des documents qui sont déjà là
						const docsToAdd = remoteChange.data.filter((doc) => !factory.some((d: Document) => d._id === doc._id || d._id === doc._oldId))
						const newerFactoryInstance = factory.set([...factory, ...docsToAdd])

						setFactories({
							...factoriesRef.current,
							[remoteChange.factoryName] : newerFactoryInstance
						})

						break;
					}

					case "patch": { // Un patch a été fait par quelqu'un d'autre, on update les données locales
						const newerFactoryInstance = factory.set(factory.map((doc: Document) => {
							const patch = remoteChange.data.find(d => d._id === doc._id);

							if(patch) { // On remplace l'ancienne version des documents par la nouvelle.
								return {...doc, ...patch}
							}
							else {
								return doc;
							}
						}))

						setFactories({
							...factoriesRef.current,
							[remoteChange.factoryName] : newerFactoryInstance
						})

						break;
					}

					case "delete": { // Un delete a fait par quelqu'un d'autre, on update les données locales.
						const newerFactoryInstance = factory.set(factory.filter((doc: Document) => {
							return !remoteChange.data.includes(doc._id)
						}))

						setFactories({
							...factoriesRef.current,
							[remoteChange.factoryName] : newerFactoryInstance
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

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Mise à jour des callbacks
	useEffect(() => {
		useFactoryCallbacks.applyPost = applyPost;
		useFactoryCallbacks.applyPatch = applyPatch;
		// TODO : trouver d'où vient ce bug de type.
		// @ts-ignore
		useFactoryCallbacks.applyDelete = applyDelete;
		useFactoryCallbacks.forwardPatch = forwardPatch;
		useFactoryCallbacks.forwardDelete = forwardDelete;
	}, [])

	log.useFactoriesGroupEnd("FACTORIES");

	return factoriesRef;
}