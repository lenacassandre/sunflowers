import React, { useState } from "react";

import { CSSTransition, TransitionGroup } from "react-transition-group";

import { LeftBar } from "../LeftBar/LeftBar";
import { Main } from "../Main/Main";
import { Middle } from "../Middle/Middle";
import { Modal } from "../Modal/Modal";
import { Notification } from "../Notification/Notification";
import { RightBar } from "../RightBar/RightBar";
import { TopBar } from "../TopBar/TopBar";

import { Redirect, useLocation } from "react-router-dom";
import { View, ViewComponent } from "../../types";

/*
import { emit } from "../../service/socket";

// HOOKS
import useSession from "./useSession";
import useRouter from "./useRouter";
import useFactories from "./useFactories";
import useViewModels from "./useViewModels";
import useModals from "./useModals";
import useNotifications from "./useNotifications";
import useStore from "./useStore";
*/

import log from "../../utils/log";

//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
import { Factories } from "../../types"

type propTypes = {
	views: any;
	factories: Factories;
}

// UserClass s'étend depuis {} pour que typescript l'interprète comme un type, et non une syntaxe JSX

export const ViewComposer: React.FC<propTypes> = <UserClass extends {}>(props: propTypes) => {
	// Système de log par render
	const location = useLocation().pathname;
	log.render(location);

	log.title("HOOKS");

	// HOOKS //
	// Vue | App : définit si elles change à chaque vue où sont partagée entre toutes les vues
	/*
	// App
	const session = useSession();

	// App
	const [modals, modal] = useModals();

	// App
	const [notifications, notify] = useNotifications();

	// Vue
	const currentView: View<customUserModel> = useRouter(session.user);

	// App - même si leur chargement peut être affecté par les vues
	const factories = useFactories(currentView, session);

	// Vue
	const viewModel = useViewModels(currentView, factories);

	// Vue
	const [store, dispatch, update] = useStore(currentView, session, viewModel, notify, modal);
*/
	// Système intégré de LeftBar et RightBar
	// Vue
	const [LeftBarState, toggleLeftBar] = useState(window.innerWidth > 1000);
	const [RightBarState, toggleRightBar] = useState(false);

	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	// Flux
	/*
	// Flux permet de passer toutes les fonctions et states essentielles au fonctionnement de l'interface.
	function flux(ViewComp: ViewComponent<customUserModel>): React.ReactElement {
		return (
			<ViewComp
				store={store}
				factories={viewModel}
				dispatch={dispatch}
				update={update}
				emit={emit}
				notify={notify}
				modal={modal}
				session={session}
			/>
		);
	}
*/
	//◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤//
	//◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣◤◣//
	// Rendu de la vue

	log.title("\nDURING RENDER");

	let view;
	/*
	// REDIRECTION EN CAS DE VUE INCONNUE
	if (!currentView) {
		view = <Redirect to="/" />;
	}
	// RENDU DE LA VUE
	else {*/
	view =
		<div />; /*(
			<React.Fragment>
				<div className={`View${store.className ? " " + store.className : ""}${LeftBarState ? " menu" : ""}`}>
					{currentView.LeftBar && <LeftBar active={LeftBarState}>{flux(currentView.LeftBar)}</LeftBar>}
					{(currentView.TopBar || currentView.Main) && (
						<Middle>
							{currentView.Main && (
								<Main>
									{flux(currentView.Main)}
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
							{currentView.TopBar && (
								<TopBar
									leftBarState={LeftBarState}
									rightBarState={RightBarState}
									toggleLeftBar={toggleLeftBar}
									toggleRightBar={toggleRightBar}
								>
									{flux(currentView.TopBar)}
								</TopBar>
							)}
						</Middle>
					)}
					<RightBar active={RightBarState}>{currentView.RightBar && flux(currentView.RightBar)}</RightBar>
				</div>
				<TransitionGroup className="viewModals">
					{modals &&
						modals.length > 0 &&
						modals.map((modal, index) => (
							<CSSTransition timeout={200} key={index}>
								<Modal
									{...modal}
									resolve={(values: any) => {
										if (modal.resolve) {
											modal.resolve(values);
										}

										modal.close();
									}}
									reject={() => {
										if (modal.reject) {
											modal.reject();
										}

										modal.close();
									}}
								/>
							</CSSTransition>
						))}
				</TransitionGroup>
			</React.Fragment>
		);
	}*/

	log.title("\nAFTER RENDER");

	return view;
}
