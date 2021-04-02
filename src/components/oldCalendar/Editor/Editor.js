import "./Editor.scss";

import {
	Button,
	CheckBox,
	DatePicker,
	DropDownSearch,
	DropDownSelect,
	Input,
} from "../../";
import {
	EDITOR,
	TASK,
} from "../../../views/ReferentTeacherCalendar/RTCalendar.actions";
import React, { useEffect, useState } from "react";
import { faTimes, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import formatNumber from "../../../functions/formatNumber";

const titleRef = React.createRef();

function getSkills(store, promotions, date) {
	let promoSkills = [];

	promotions.forEach((promoId) => {
		// Trouve l'objet de promotion en fonction de l'id de la promotion
		const promotion = store.userPromotions.find((p) => p._id === promoId);

		if (promotion) {
			// Trouve le niveau de formation de la promotion
			const level = store.userLevels.find(
				(l) => l._id === promotion.niveau
			);

			if (level) {
				// Trouve tous les niveaux de la même filière
				const levels = store.userLevels.filter(
					(l) => l.faculty === level.faculty
				);

				if (levels) {
					// Trouve l'année scolaire de la promo
					const anneeSco = store.anneesScolaires.find(
						(a) => a._id === promotion.anneeScolaire
					);

					if (
						anneeSco &&
						anneeSco.start &&
						anneeSco.firstSemesterStart &&
						anneeSco.firstSemesterEnd &&
						anneeSco.secondSemesterStart &&
						anneeSco.secondSemesterEnd &&
						anneeSco.end
					) {
						// Trouve le numéro de semestre dans lequel est actuellement la promo
						let semester =
							anneeSco.firstSemesterStart <= date &&
							date <= anneeSco.firstSemesterEnd
								? 1
								: anneeSco.secondSemesterStart <= date &&
								  date <= anneeSco.secondSemesterEnd
								? 2
								: undefined;

						if (semester >= 1) {
							const levelIndex = levels.findIndex(
								(l) => l._id === level._id
							);

							if (levelIndex >= 0) {
								semester = levelIndex * 2 + semester;
								promoSkills = promoSkills.concat(
									store.userSkills.filter(
										(s) => s.semester === semester
									)
								);
							}
						}
					}
				}
			}
		}
	});

	return promoSkills;
}

export default function Editor({ store, dispatch, taskRect, modal }) {
	const _id = store.editor;
	const task = store.userTasks.find((t) => t._id === _id);

	const style = { width: "25rem" };
	const arrowStyle = {};
	let arrowClassName;

	if (taskRect) {
		// Calcul de la position Y de l'éditeur
		style.top = `${taskRect.top + taskRect.height / 2}%`;
		style.transform = `translateY(-${taskRect.top + taskRect.height / 2}%)`;

		// Calcul de la position Y de la flèche de l'éditeur
		arrowStyle.top = `calc(${
			(taskRect.top + taskRect.height / 2) / 100
		} * (100% - 2rem) + 0.25rem)`;

		// Le calcul de la position X n'est pas le même en mode journée
		if (store.mode === 1 && taskRect.width > 50) {
			// Position X de l'éditeur
			style.left = `calc(100% - (${style.width} + 0.75rem))`;
			// Origine de l'animation de l'éditeur
			style.transformOrigin = "right " + arrowStyle.top;
			// Position X de la flèche
			arrowStyle.left = "-0.75rem";
		} else {
			// Affichage de l'éditeur à droite de la prestation
			if (taskRect.left < 40) {
				// Position X de l'éditeur
				style.left = `calc(${
					taskRect.left + taskRect.width
				}% + 0.75rem)`;
				// Origine de l'animation de l'éditeur
				style.transformOrigin = "left " + arrowStyle.top;
				// Position X de la flèche de l'éditeur
				arrowStyle.left = "-0.75rem";
			} else {
				// Position X de l'éditeur
				style.left = `calc(${taskRect.left}% - (${style.width} + 0.75rem))`;
				// Origine de l'animation de l'éditeur
				style.transformOrigin = "right " + arrowStyle.top;
				// Position X de la flèche de l'éditeur
				arrowStyle.left = "24.25rem";
			}
		}
	}

	// Autofocus
	useEffect(() => {
		if (titleRef && titleRef.current) {
			titleRef.current.focus();
		}
	}, [task._id]);

	if (task) {
		// Génération des horaire disponibles /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		const hours = [];

		for (
			let navHour = store.startingMinutes;
			navHour <= store.endingMinutes - task.duration;
			navHour += store.user.divisionDuration
		) {
			const minutes = navHour % 60;
			const hour = (navHour - minutes) / 60;

			const newDate = new Date(task.date);
			newDate.setHours(hour);
			newDate.setMinutes(minutes);

			hours.push(newDate);
		}

		const displayHour = (h) =>
			`${formatNumber(h.getHours())}:${formatNumber(h.getMinutes())}`;

		// Génération des durées possibles /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		const durations = [];

		const taskStart = task.date.getHours() * 60 + task.date.getMinutes();

		const limit = task.deadline ? 25 * 60 : store.endingMinutes - taskStart;

		for (
			let navMinutes = store.user.divisionDuration;
			navMinutes <= limit;
			navMinutes += store.user.divisionDuration
		) {
			durations.push(navMinutes);
		}

		const displayDuration = (d) => {
			const minutes = d % 60;
			const hours = (d - minutes) / 60;
			return `${hours > 0 ? `${String(hours)}h` : ""}${formatNumber(
				minutes
			)}${hours === 0 ? "mn" : ""}`;
		};

		// Génération d'un tableau des compétences //////////////////////////////////////////
		const skills = getSkills(store, task.promotion, task.date);

		// Génération des tarifs/types /////////////////////////////////////////////////////////////////
		const vacataire = store.vacataires.find((v) => v._id === task.teacher);
		const TwoDecimal = (num) => (Math.round(num * 100) / 100).toFixed(2);

		const tarifs = store.userTarifs
			.map((tarif) => {
				const type = store.types.find(
					(type) => type._id === tarif.type
				);

				if (type) {
					return {
						...tarif,
						string: `
							${type.sigle} ${
							!vacataire || vacataire.statut >= 3
								? `(${
										!vacataire || vacataire.statut === 4
											? TwoDecimal(tarif.ctu)
											: ""
								  }${!vacataire ? " - " : ""}${
										!vacataire || vacataire.statut === 3
											? TwoDecimal(tarif.prestation)
											: ""
								  }€ / h)`
								: ""
						}`,
						displayString: type.sigle + " - " + type.name,
					};
				}
			})
			.filter((tarif) => tarif);

		// CHECK SI LA TASK EST SIGNÉE //////////////////////////////////////////////////
		let signed, contrat;

		if (vacataire && store.cdcs) {
			const cdc = store.cdcs.find((c) => c.tasks.includes(_id));

			if (store.contrats && cdc) {
				contrat = store.contrats.find(
					(contrat) =>
						contrat.cdcs.includes(cdc._id) &&
						Boolean(contrat.signingDate)
				);

				if (contrat) {
					signed = true;
				}
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////
		// FORMULAIRE DE DEPLACEMENT D'UN COURS ///////////////////////////////////////////////////

		let start, end, moveForm;

		if (signed) {
			if (contrat && contrat.cdcs) {
				const cdcs = store.cdcs.filter((cdc) =>
					contrat.cdcs.includes(cdc._id)
				);
				let tasks_ids = [];
				cdcs.map((cdc) => {
					if (cdc && cdc.tasks) {
						tasks_ids = tasks_ids.concat(cdc.tasks);
					}
				});

				const tasks = tasks_ids
					.map((task_id) => {
						return store.tasksArray.find((t) => t._id === task_id);
					})
					.filter((t) => t);

				tasks.forEach((t) => {
					if (t.date && t.date.getTime && !isNaN(t.date.getTime())) {
						if (!start || t.date < start) {
							start = new Date(t.date);
						}

						if (!end || t.date > end) {
							end = new Date(t.date);
						}
					}
				});

				start = bottomDate(start);
				end = topDate(end);
			}
		}

		////////////////////////////////////////////////////////////////////////////
		// RENDER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		return (
			<div
				className={`Editor${signed ? " signed" : ""}`}
				style={style}
				onMouseDown={(event) => dispatch({ event })}
				onClick={(event) => dispatch({ event })}
				onMouseUp={(event) => dispatch({ event })}
			>
				<div className="editorArrow" style={arrowStyle} />
				{signed || task.cancelled ? (
					<>
						<div className="signedButtons">
							<Button
								className="closeButton"
								name="Fermer"
								onClick={(event) =>
									dispatch({
										type: EDITOR.CLICK_ICON.CLOSE,
										event,
									})
								}
							/>
							{task.cancelled ? (
								<Button
									className="saveButton"
									name="Rétablir"
									filled
									click={() => {
										modal({
											title: "Rétablir l'intervention",
											message:
												"Souhaitez-vous rétablir cette intervention ?",
											resolveButton:
												"Rétablir l'intervention",
											rejectButton: "Fermer",
										}).then(() =>
											dispatch({
												type: TASK.PATCH.DO,
												data: {
													_id: task._id,
													patch: { cancelled: false },
												},
											})
										);
									}}
								/>
							) : (
								<Button
									className="cancelButton"
									name="Annuler"
									filled
									click={() => {
										modal({
											title: "Annuler l'intervention",
											message:
												"Souhaitez-vous annuler cette intervention ? Un avenant au contrat sera créé.",
											rejectButton: "Fermer",
											resolveButton:
												"Annuler l'intervention",
										}).then(() =>
											dispatch({
												type: TASK.PATCH.DO,
												data: {
													_id: task._id,
													patch: { cancelled: true },
												},
											})
										);
									}}
								/>
							)}

							<Button
								className="reportButton"
								name="Déplacer"
								filled
								click={() => {
									modal({
										title: "Déplacer",
										message:
											"Choisissez une nouvelle date. Aucun avenant ne sera créé.",
										form: (
											<MoveForm
												modal={modal}
												start={start}
												end={end}
												date={task.date}
												hours={hours}
												displayHour={displayHour}
											/>
										),
										className: "moveModal",
									}).then(({ date }) => {
										console.log("then date", date);

										dispatch({
											type: TASK.PATCH.DO,
											data: {
												_id: task._id,
												patch: {
													date: new Date(date),
													cancelled: false,
												},
											},
										});
									});
								}}
							/>
						</div>
					</>
				) : (
					<>
						<Input
							value={task.title}
							name="title"
							label="Intitulé"
							className="intitule"
							_id={"title" + task._id}
							onChange={(event) =>
								dispatch({
									type: TASK.PATCH.DO,
									data: {
										_id: task._id,
										patch: { title: event.target.value },
									},
								})
							}
							onKeyDown={(event) => dispatch({ event })}
							inputRef={titleRef}
						/>
						<Input
							value={task.description}
							name="description"
							label="Contenu"
							_id={"description" + _id}
							onChange={(event) =>
								dispatch({
									type: TASK.PATCH.DO,
									data: {
										_id: task._id,
										patch: {
											description: event.target.value,
										},
									},
								})
							}
							outlined
							className="description"
							onKeyDown={(event) => dispatch({ event })}
						/>

						<div className="selectPromoGroupUF">
							<DropDownSelect
								className="selectPromo"
								elementsList={store.userPromotions.map(
									(p) => p.name
								)}
								valuesList={store.userPromotions.map(
									(p) => p._id
								)}
								onChange={(promotion) => {
									const newSkills = getSkills(
										store,
										promotion,
										task.date
									).map((s) => s._id);

									dispatch({
										type: TASK.PATCH.DO,
										data: {
											_id: task._id,
											patch: {
												promotion,
												uf:
													task.uf &&
													newSkills.includes(task.uf)
														? task.uf
														: null,
											},
										},
									});
								}}
								value={task.promotion}
								all="Toutes"
								none="Aucune"
								multiple
								alphabetic
							/>
							{skills.length > 0 && (
								<DropDownSelect
									className="selectUF"
									elementsList={skills.map(
										(sk) => sk.sigle + " " + sk.title
									)}
									valuesList={skills.map((sk) => sk._id)}
									onChange={(uf) =>
										dispatch({
											type: TASK.PATCH.DO,
											data: {
												_id: task._id,
												patch: { uf },
											},
										})
									}
									value={task.uf}
									none="Compétence"
									displayFilter={(_id) => {
										const s = store.skills.find(
											(s) => s._id === _id
										);

										if (s) {
											return s.sigle;
										}
									}}
								/>
							)}
						</div>
						<DropDownSearch
							array={store.vacataires}
							searchKeys={["nom", "prenom", "metier"]}
							displayString="nom prenom - metier"
							callback={(teacher) =>
								dispatch({
									type: TASK.PATCH.DO,
									data: { _id: task._id, patch: { teacher } },
								})
							}
							active={task.teacher}
							className="TeacherSearchField"
							onKeyDown={(event) => dispatch({ event })}
							multiple
							label="Formateur"
						/>
						<CheckBox
							className="deadlineCheckBox"
							label="Date limite"
							value={task.deadline}
							onChange={(value) =>
								dispatch({
									type: TASK.PATCH.DO,
									data: {
										_id: task._id,
										patch: { deadline: value },
									},
								})
							}
						/>
						<div className="editorButtons">
							<Button
								click={() =>
									dispatch({
										type: EDITOR.CLICK_BUTTON.CANCEL,
									})
								}
								name="Annuler"
								className="cancelButton"
								filled
							/>
							<Button
								click={() =>
									dispatch({ type: EDITOR.CLICK_BUTTON.SAVE })
								}
								name="Enregistrer"
								className="saveButton"
								filled
								disabled={
									task.overlapingTasks &&
									task.overlapingTasks.length > 0
								}
							/>
						</div>

						<div className="dateTimePicker">
							<DatePicker
								value={task.date}
								modal={modal}
								onChange={(date) =>
									dispatch({
										type: EDITOR.CHANGE.DATE,
										data: {
											_id: task._id,
											patch: { date },
										},
									})
								}
								start={store.startingDate}
								end={store.endingDate}
								middle
							/>
							<DropDownSelect
								className="selectHour"
								elementsList={hours.map(displayHour)}
								valuesList={hours}
								onChange={(date) =>
									dispatch({
										type: TASK.PATCH.DO,
										data: {
											_id: task._id,
											patch: { date },
										},
									})
								}
								value={task.date}
								displayFilter={displayHour}
							/>
						</div>

						<div className="row typesTarifs">
							<DropDownSelect
								className="tarifs"
								elementsList={tarifs.map((t) => t.string)}
								valuesList={tarifs.map((t) => t._id)}
								onChange={(tarif) =>
									dispatch({
										type: TASK.PATCH.DO,
										data: {
											_id: task._id,
											patch: { tarif },
										},
									})
								}
								value={task.tarif}
								none="Tarif"
								displayFilter={(_id) => {
									const tarif = tarifs.find(
										(t) => t._id === _id
									);

									if (tarif) {
										return tarif.displayString;
									} else {
										return "erreur";
									}
								}}
								alphabetic
							/>
							<DropDownSelect
								className="selectDuration"
								elementsList={durations.map(displayDuration)}
								valuesList={durations}
								onChange={(duration) =>
									dispatch({
										type: TASK.PATCH.DO,
										data: {
											_id: task._id,
											patch: { duration },
										},
									})
								}
								value={task.duration}
								displayFilter={displayDuration}
							/>
						</div>

						<div className="editorIcons">
							<Button
								onClick={(event) =>
									store.user.skipRemoveModal
										? dispatch({
												type: TASK.DELETE.DO,
												data: task._id,
										  })
										: modal({
												title:
													"Suppression définitive d'une demande de prestation",
												message:
													"Souhaitez vous supprimer défitivement cette demande de prestation ?",
												reject: "Annuler",
												resolveButton: "Supprimer",
												form: (
													<CheckBox
														name="skipRemoveModal"
														label="Ne plus me demander"
														value={
															store.user
																.skipRemoveModal
														}
														onChange={() =>
															store.user.patch({
																skipRemoveModal: !store
																	.user
																	.skipRemoveModal,
															})
														}
													/>
												),
										  }).then(() => {
												if (task) {
													dispatch({
														type: TASK.DELETE.DO,
														data: task._id,
													});
												}
										  })
								}
								className="deleteIcon"
								icon={faTrashAlt}
							/>
							<Button
								onClick={(event) =>
									dispatch({
										type: EDITOR.CLICK_ICON.CLOSE,
										event,
									})
								}
								className="quitIcon"
								icon={faTimes}
							/>
						</div>
					</>
				)}
			</div>
		);
	} else {
		return "";
	}
}

// MODAL DE DEPLACEMENT D'UN COURS SIGNÉ
const MoveForm = ({
	resolve,
	reject,
	modal,
	start,
	end,
	date,
	hours,
	displayHour,
}) => {
	const [newDate, setNewDate] = useState(date || start || end || new Date());

	console.log("modal newDate", newDate);

	return (
		<>
			<div className="row">
				<DatePicker
					input
					required
					name="date"
					modal={modal}
					start={start}
					end={end}
					value={newDate}
					onChange={(d) => {
						const nDate = new Date(newDate);
						nDate.setFullYear(d.getFullYear());
						nDate.setMonth(d.getMonth());
						nDate.setDate(d.getDate());
						setNewDate(new Date(nDate));
					}}
				/>
				<DropDownSelect
					className="selectHour"
					elementsList={hours.map(displayHour)}
					valuesList={hours}
					onChange={(d) => {
						const nDate = new Date(newDate);
						nDate.setHours(d.getHours());
						nDate.setMinutes(d.getMinutes());
						setNewDate(new Date(nDate));
					}}
					value={newDate}
					displayFilter={displayHour}
				/>
			</div>
			<div className="buttonsRow">
				<Button
					className="rejectButton"
					name="Annuler"
					onClick={() => reject()}
				/>
				<Button
					className="resolveButton"
					name="Déplacer"
					onClick={() => resolve({ date: newDate })}
				/>
			</div>
		</>
	);
};

function topDate(d) {
	const newDate = new Date(d);

	newDate.setHours(23);
	newDate.setMinutes(59);
	newDate.setSeconds(59);
	newDate.setMilliseconds(999);

	return newDate;
}

function bottomDate(d) {
	const newDate = new Date(d);

	newDate.setHours(0);
	newDate.setMinutes(0);
	newDate.setSeconds(0);
	newDate.setMilliseconds(0);

	return newDate;
}
