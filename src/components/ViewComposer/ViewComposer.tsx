import React, { useCallback, useRef, useState } from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { LeftBar } from "../LeftBar/LeftBar";
import { Main } from "../Main/Main";
import { Middle } from "../Middle/Middle";
import { Modal } from "../Modal/Modal";
import { Notification } from "../Notification/Notification";
import { RightBar } from "../RightBar/RightBar";
import { TopBar } from "../TopBar/TopBar";

import { CallModal, Emit, Notify, RouterSystem, SessionSystem, View, ViewComponent, ViewDeclaration, ViewsTree, ViewSystem } from "../../types";

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

import { Repositories } from '../../types'
import User from "./classes/user.class";

console.clear()

import './ViewComposer.scss'
import { Promise } from "../..";

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//

export const Context = React.createContext<{
	emit?: Emit,
	get?: <ResponseType = {}>(route: string, body?: any) => Promise<typeof body, ResponseType>,
	post?: <ResponseType = {}>(route: string, body?: any, head?: any) => Promise<typeof body, ResponseType>,
	notify?: Notify,
	modal?: CallModal,
	session?: SessionSystem<any>,
	router?: RouterSystem<any>,
	repository?: Repositories
}>({});

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
		repositories: repositoriesRef.current
	}

	let view = (
		<div className={`App${router._currentViewDeclaration.className ? ` ${router._currentViewDeclaration.className}` : ""}`}>
			<Context.Provider // Permet aux composants de la bibliothèque d'accéder aux méthodes de hook
				value={contextValue}
			>
				<div className={`View${store.className ? " " + store.className : ""}${LeftBarState ? " menu" : ""}`}>
					{router._currentViewDeclaration.view.LeftBar && <LeftBar active={LeftBarState}>{flux(router._currentViewDeclaration.view.LeftBar)}</LeftBar>}
					{(router._currentViewDeclaration.view.TopBar || router._currentViewDeclaration.view.Main) && (
						<Middle>
							{router._currentViewDeclaration.view.Main && (
								<Main>
									<Context.Consumer>
										{
											(context) => {
												console.log("VIEW COMPOSER context",context)
												return <div></div>
											}
										}
									</Context.Consumer>
									{flux(router._currentViewDeclaration.view.Main)}
									<div className="notificationsContainer">
										<TransitionGroup className="notificationsTransitionGroup">
											{notifications.map((notif, index) => (
												<CSSTransition
													key={notif.id}
													timeout={500}
													classNames={`${notif.closing} notificationTransition`}
												>
													<Notification
														id={notif.id}
														close={notif.close}
														style={{
															bottom: String(index * 3.5) + "rem",
														}}
														className={notif.color}
													>
														{notif.content}
													</Notification>
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
			</Context.Provider>
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
	views: ViewsTree<UserDocumentClass>;
	defaultView: ViewDeclaration<UserDocumentClass, any>;
	repositories: Repositories;
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