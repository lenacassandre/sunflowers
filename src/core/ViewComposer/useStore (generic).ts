import { useState, useRef, useEffect } from "react";
import { View, Notify, CallModal, SessionSystem, Dispatch, Update, Navigate, RouterSystem, BaseActionsType, Repositories } from "../../types";

import Socket from "../../service/socket";

import Repository from "../../classes/repository.class"

import log from "../../utils/log";
import User from "../../classes/user.class";
import { BaseRepositoriesType, BaseStoreType, Reducer } from "../..";

type obj = { [storeProp: string]: any }

let previousView: View<any, any> | undefined;

export default function useStore<
    U extends User,
    S extends BaseStoreType = BaseStoreType,
    R extends BaseRepositoriesType = BaseRepositoriesType,
    A extends BaseActionsType = BaseActionsType
>(
	socket: Socket,
	session: SessionSystem<U>,
	router: RouterSystem<U>,
	repositoriesRef: React.MutableRefObject<R>,
	notify: Notify,
	modal: CallModal,
    defaultStore: S,
    reducer?: Reducer<U, S, R, A>
): {
    store: S,
    update: Update<S>,
    dispatch: Dispatch<A>,
    set: (store: S) => void
} {
    const [store, setStore] = useState<S>(defaultStore);
	const storeRef = useRef(store);
    storeRef.current = store;

	// La fonction upadte permet de faire des modifications immédiates au niveau du store/vue sans
	// passer par un reducer
	function update(updates: { [storeProp: string]: any }) {
		if (typeof updates === "object") {
			setStore({ ...storeRef.current, ...updates });
		} else {
			throw new Error("L'argument passé à la fonction view.update doit être un objet, une partielle du store.");
		}
	}

	/**
	 * Fonction essentiel au système de vue/flux. Elle seule permet de sauvegarder le store, et donc
	 * de sauvegarder les informations affichées dans l'interface.
	 * Elle prend en argument un objet, dont les propriétés sont :
	 * - Un type d'action. (obligatoire)
	 * - Un évènement, pour que le reducer puisse accéder à la position du curseur, par exemple. (facultatif)
	 * - Des données supplémentaires. (facultatif)
	 * @param type
	 * @param action
	 */
	const dispatch: Dispatch<A> = (type, action) => {
		// La spécification d'un type d'action est obligatoire pour déclencher une action
		if (action && reducer) {
			// On appelle le reducer avec toutes les informations passées en argument.
			// Il nous renvoie un objet de mise à jour ou null.

			let updates: any;
			try {
				updates = reducer(type, action, {
					store: storeRef.current,
					repositories: repositoriesRef.current,
					notify,
					dispatch: (type2, action2) => setTimeout(() => dispatch(type2, action2)),
					emit: socket.emit,
					post: socket.emit,
					get: socket.get,
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

	return {
        store,
        update,
        dispatch,
        set: setStore
    }
}
