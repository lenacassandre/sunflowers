import React, { useCallback, useRef, useState, useContext } from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { LeftBar } from "../LeftBar/LeftBar";
import { Main } from "../Main/Main";
import { Middle } from "../Middle/Middle";
import { Modal } from "../Modal/Modal";
import { DefaultNotification } from "../DefautNotification/DefaultNotification";
import { RightBar } from "../RightBar/RightBar";
import { TopBar } from "../TopBar/TopBar";

import { BaseRepositoriesType, BaseStoreType, CallModal, Emit, ModalDeclaration, ModalForm, Notify, RouterSystem, SessionSystem, View, ViewComponent, ViewDeclaration, ViewsTree, ViewSystem } from "../../types";

import Socket from "../../service/socket";

// HOOKS
import useSession from "./useSession";
import useRouter from "./useRouter";
import useRepositories from "./useRepositories";
import useViewModels from "./useViewModels";
import useModals from "./useModals";
import useNotifications from "./useNotifications";
import useStore from "./useStore";


import log from "../../utils/log";

import { Repositories, ContextType } from '../../types'
import User from "../../classes/user.class";

console.clear()

import './ViewComposer.scss'
import { Promise } from "true-promise";

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

export const SunContext = React.createContext<ContextType<any>>({
	//@ts-ignore
	emit: () => new Promise((_resolve, reject) => reject({error: "timeout"})),
	//@ts-ignore
	get: () => new Promise((_resolve, reject) => reject({error: "timeout"})),
	//@ts-ignore
	post: () => new Promise((_resolve, reject) => reject({error: "timeout"})),
	notify: (_message, _color) => {},
	modal: (_modalArg) => new Promise((_resolve, reject) => reject()),
	session: {
		user: null,
		token: null,
		organization: null,
		login: (_userName, _password) => new Promise((_resolve, reject) => reject({error: "timeout"})),
		logout: () => {},
		switchOrganization: () => Promise.reject({error: "Session has not been initialize yet."}),
		saveUser: (_user) => {},
		saveSession: (_user, _session) => {},
		saveToken: (_token) => {},
		saveOrganization: (organizationId) => {}
	},
	router: {
		path: "",
		params: {},
		navigate: (route) => {},
		_currentViewDeclaration: {
			path: '',
			title: "",
			//@ts-ignore
			view: null
		}
	},
	store: {},
	update: (updates) => {},
	repositories: {},
});


export function useSunContext<
	StoreType extends BaseStoreType = BaseStoreType,
	RepositoriesType extends BaseRepositoriesType = BaseRepositoriesType
>() {
	//@ts-ignore
	const context: ContextType<StoreType, RepositoriesType> = useContext(SunContext);
	return context;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////:

type ViewComposerBasePropType<UserDocumentClass> = {
	views: any;
	defaultView: ViewDeclaration<UserDocumentClass, any>;
	repositories: Repositories;
	socket: Socket;
	UserModel: { new(user: UserDocumentClass): UserDocumentClass };
}

///////////////////////////////////////////////////////////////////////////////////////////////////////:

// UserClass s'étend depuis {} pour que typescript l'interprète comme un type, et non une syntaxe JSX
function ViewComposerBase<UserDocumentClass extends User>(props: ViewComposerBasePropType<UserDocumentClass>): JSX.Element {
	//Système de log par render
	log.render(window.location.pathname || "/");

	log.title("HOOKS");

	///////////////////////////////////////////////////////////////////////////////////////
	// HOOKS //////////////////////////////////////////////////////////////////////////////
	// Vue | App : définit si elles change à chaque vue où sont partagée entre toutes les vues
	// App level
	const session = useSession<UserDocumentClass>(props.socket, props.UserModel);

	// App level
	const [modals, callModal] = useModals();

	// App level
	const [notifications, notify] = useNotifications();

	// Vue level
	const router = useRouter<UserDocumentClass>(session, props.views, props.defaultView);

	// App level - même si leur chargement peut être affecté par les vues
	// Gestion des données persistentes - reliées au serveur
	const repositoriesRef = useRepositories<UserDocumentClass>(props.socket, props.repositories, session);

	// Vue level
	// Traitement des données qui viennent de fa
	//const viewModel = useViewModels(currentViewDeclaration, repositories);

	// Vue level
	// Gestion des données non percistentes nécessaires à l'UI.
	const [store, dispatch, update] = useStore<UserDocumentClass>(
		props.socket,
		router._currentViewDeclaration.view,
		session,
		repositoriesRef,
		notify,
		callModal,
		router
	);

	// Vue level
	// Système intégré de LeftBar et RightBar
	const [LeftBarState, toggleLeftBar] = useState(window.innerWidth > 1000);
	const [RightBarState, toggleRightBar] = useState(false);

	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	// Flux

	// Flux permet de passer toutes les fonctions et states essentielles au fonctionnement de l'interface.
	const flux = (ViewComponent: ViewComponent<UserDocumentClass, typeof store>): React.ReactElement => {
		return (
			<ViewComponent
				store={store}
				repositories={repositoriesRef.current}
				dispatch={dispatch}
				update={update}
				emit={props.socket.emit}
				get={props.socket.get}
				post={props.socket.post}
				notify={notify}
				modal={callModal}
				session={session}
				router={router}
			/>
		);
	}

	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	// Rendu de la vue

	log.title("\nDURING RENDER");

	const contextValue = {
		emit: props.socket.emit,
		get: props.socket.get,
		post: props.socket.post,
		notify,
		modal: callModal,
		session,
		router,
		repositories: repositoriesRef.current,
		store,
		update,
		dispatch
	}

	let view = (
		<div className={`App${router._currentViewDeclaration.className ? ` ${router._currentViewDeclaration.className}` : ""}`}>
			<SunContext.Provider // Permet aux composants de la bibliothèque d'accéder aux méthodes de hook
				value={contextValue}
			>
				<div className={`View${store.className ? " " + store.className : ""}${LeftBarState ? " menu" : ""}`}>
					{router._currentViewDeclaration.view.LeftBar && <LeftBar active={LeftBarState}>{flux(router._currentViewDeclaration.view.LeftBar)}</LeftBar>}
					{(router._currentViewDeclaration.view.TopBar || router._currentViewDeclaration.view.Main) && (
						<Middle>
							{router._currentViewDeclaration.view.Main && (
								<Main>
									{flux(router._currentViewDeclaration.view.Main)}
									<div className="notificationsContainer">
										<TransitionGroup className="notificationsTransitionGroup">
											{notifications.map((notif, index) => (
												<CSSTransition
													key={notif.id}
													timeout={500}
													classNames={`${notif.closing} notificationTransition`}
												>
													<DefaultNotification
														id={notif.id}
														close={notif.close}
														style={{
															bottom: String(index * 3.5) + "rem",
														}}
														className={notif.color}
													>
														{notif.content}
													</DefaultNotification>
												</CSSTransition>
											))}
										</TransitionGroup>
									</div>
								</Main>
							)}
							{router._currentViewDeclaration.view.TopBar && (
								<TopBar
									leftBarState={LeftBarState}
									rightBarState={RightBarState}
									toggleLeftBar={toggleLeftBar}
									toggleRightBar={toggleRightBar}
								>
									{flux(router._currentViewDeclaration.view.TopBar)}
								</TopBar>
							)}
						</Middle>
					)}
					{router._currentViewDeclaration.view.RightBar && <RightBar active={RightBarState}>{router._currentViewDeclaration.view.RightBar && flux(router._currentViewDeclaration.view.RightBar)}</RightBar>}
				</div>
				<TransitionGroup className="viewModals">
					{modals &&
						modals.length > 0 &&
						modals.map((modal, index) => (
							<CSSTransition timeout={typeof modal.delay === "number" ? modal.delay : 500} key={index}>
								<Modal
									{...modal}
									resolve={(values: any) => {
										if (modal.resolve) {
											modal.resolve(values);
										}

										modal.close(true);
									}}
									reject={(data?: any) => {
										if (modal.reject) {
											modal.reject(data);
										}

										modal.close();
									}}
								/>
							</CSSTransition>
						))}
				</TransitionGroup>
			</SunContext.Provider>
		</div>
	);

	log.title("\nAFTER RENDER");

	return view;
}

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

type ViewComposerPropType<UserDocumentClass> = {
	repositories: Repositories;
	views: ViewsTree<UserDocumentClass>;
	defaultView: ViewDeclaration<UserDocumentClass, any>;
	socketURL: string
	httpURL?: string
	UserModel: { new(user: UserDocumentClass): UserDocumentClass }
}

// Ce composant sert à initaliser certaines valeur, afin de ne jamais les recalculer aux rendus suivant.
export function ViewComposer<UserType extends User>(props: ViewComposerPropType<UserType>): JSX.Element {
	const socket = new Socket(props.socketURL, props.httpURL);
	const defaultView = props.views.find(vd => vd.default);

	if(!defaultView) {
		throw new Error("No default view has been provided. Please add the property \"default: true\“ to one of your ViewDeclaration inside your ViewsTree.")
	}

	return (
		<ViewComposerBase<UserType>
			{...props}
			socket={socket}
			defaultView={defaultView}
		/>
	)
}