import { useState, useRef, useEffect } from "react";
import { View, Notify, CallModal, SessionSystem, Dispatch, Update, Navigate, RouterSystem, BaseActionsType, Repositories } from "../../types";

import Socket from "../../service/socket";

import Repository from "./classes/repository.class"

import log from "../../utils/log";
import User from "./classes/user.class";

let previousView: View<any, any> | undefined;

export default function useStore<CustomUserDocument extends User>(
	socket: Socket,
	currentView: View<CustomUserDocument, any>,
	session: SessionSystem<CustomUserDocument>,
	repositoriesRef: React.MutableRefObject<Repositories>,
	notify: Notify,
	modal: CallModal,
	router: RouterSystem<CustomUserDocument>
): [any, Dispatch<any>, Update<{[key: string]: any}>] {
	log.useStoreGroup();

	const [storeState, setStore] = useState<{ [storeProp: string]: any }>(currentView.store);
	const storeRef = useRef(storeState);
	storeRef.current = storeState;

	log.useStore("store", storeRef.current)

	// La fonction upadte permet de faire des modifications immédiates au niveau du store/vue sans
	// passer par un reducer
	function update(updates: { [storeProp: string]: any }) {
		if (typeof updates === "object") {
			setStore({ ...storeRef.current, ...updates });
		} else {
			throw new Error("L'argument passé à la fonction view.update doit être un objet, une partielle du store.");
		}
	}

	// Fonction essentiel au système de vue/flux. Elle seule permet de modifier le store, et donc
	// de modifier les informations affichées dans l'interface.
	// Elle prend en argument un objet, dont les propriétés sont :
	// - Un type d'action. (obligatoire)
	// - Un évènement, pour que le reducer puisse accéder à la position du curseur, par exemple. (facultatif)
	// - Des données supplémentaires. (facultatif)
	const dispatch: Dispatch<BaseActionsType> = (type, action) => {
		// La spécification d'un type d'action est obligatoire pour déclencher une action
		if (action && currentView && currentView.reducer) {
			// On appelle le reducer avec toutes les informations passées en argument.
			// Il nous renvoie un objet de mise à jour ou null.

			let updates: any;
			try {
				updates = currentView.reducer(type, action, {
					store: storeRef.current,
					repositories: repositoriesRef.current,
					notify,
					dispatch: (type2, action2) => setTimeout(() => dispatch(type2, action2)),
					emit: socket.emit,
					update,
					router,
					modal,
					session
				});
			} catch (error) {
				console.error(error);
			}

			// Si une update est renvoyée par le reducer, on met à jour le store, ce qui déclenche un render.
			if (updates !== null && updates !== undefined) {
				setStore({ ...storeRef.current, ...updates });
			}
		}
	}

	useEffect(() => {
		setStore(currentView.store)
	}, [currentView])

	log.useStoreGroupEnd("STORE");

	// Réagit immédiatement au changement de vue, contrairement au useEffect
	const storeToSend = !previousView || previousView === currentView ? storeRef.current : currentView.store;
	previousView = currentView;

	return [storeToSend, dispatch, update];
}
