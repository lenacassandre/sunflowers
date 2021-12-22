import { useState, useRef } from "react";
import { Promise } from "true-promise";
import {  Modals, CallModal, ModalForm, ModalDeclaration } from "../../types";

import log from "../../utils/log";

//////////////////////////////////////////////////////////////////////////////////////////////////////////
export default function useModals(): [Modals, CallModal] {
	log.useModalsGroup();

	// Système intégré de fenêtres modales
	const defaultModalList: Modals = [];

	const [modalList, setModalList] = useState(defaultModalList);
	const modalListRef: React.MutableRefObject<any[]> = useRef(modalList);
	modalListRef.current = modalList;

	/**
	 * Appelle une fenêtre modale.
	 * @param modalObject Un ModalObject, un React.FC<{resolve, reject}>, ou un JSX.Element
	 * @returns
	 */
	function modal<FormType = {}>(modalArg: ModalDeclaration | ModalForm): Promise<FormType, void> {
		const newModalIndex = modalListRef.current.length;
		let newModal: ModalDeclaration;

		//////////////////////////////////////////////////////////////////////////////////////////////////:
		// La modale est une React.FC
		if(typeof modalArg === "function") {
			newModal = {
				form: modalArg
			}
		}
		///////////////////////////////////////////////////////////////////////////////////////////////
		// La modale est un élément JSX
		else if(
			typeof modalArg === "object"
			// @ts-ignore
			&& modalArg["$$typeof"]
			// @ts-ignore
			&& String(modalArg["$$typeof"]) === "Symbol(react.element)"
		) {
			newModal = {
				// @ts-ignore
				form: modalArg
			}
		}
		////////////////////////////////////////////////////////////////////////////////////////////////
		// La modale est un objet de modale
		else if(typeof modalArg === "object") {
			// @ts-ignore
			newModal = modalArg
		}
		////////////////////////////////////////////////////////////////////////////////////////////////
		// Erreur. Retourne une auto-reject promise
		else {
			return new Promise((_resolve, reject) => reject())
		}

		let modalObject;

		const promise = new Promise<FormType, void>((resolve, reject) => {
			modalObject = {
				...newModal,
				close: (resolving?: boolean) => closeModal(newModalIndex, resolving),
				resolve,
				reject,
			};
		})

		// Default handling function
		promise.then(()=>{}).catch(()=>{});

		setModalList([...modalListRef.current, modalObject]);

		return promise;
	}

	function closeModal(index: number, resolving?: boolean) {
		log.useModals("close modal", index);

		// Indique que la modal part en étant résolue, si c'est le cas
		if(resolving) {
			setModalList(
				modalListRef.current.map((modal, modalIndex) =>
					modalIndex !== index
						? modal
						: {...modal, resolving}
				)
			);
		}

		// Supprime la modale
		setTimeout(() =>
			setModalList(
				modalListRef.current.filter((_modal, modalIndex) => index !== modalIndex)
			)
		);
	}

	log.useModalsGroupEnd("MODALS");

	return [modalListRef.current, modal];
}
