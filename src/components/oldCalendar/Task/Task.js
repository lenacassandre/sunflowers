import React, { useEffect, useState } from "react";
import HourRange from "../../HourRange/HourRange";
import Date from "../../Date/Date";
import Duration from "../../Duration/Duration";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChalkboardTeacher,
	faLock,
	faPaperPlane,
	faWindowClose,
	faPenNib,
	faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
	TASK,
	CA,
} from "../../../views/ReferentTeacherCalendar/RTCalendar.actions";

import { TransitionGroup, CSSTransition } from "react-transition-group";

import formatNumber from "../../../functions/formatNumber";

import "./Task.scss";

// CLASSE TASK //////////////////////////////////////////////////////////////
function Task({
	children,
	className,
	top,
	height,
	task,
	store,
	dispatch,
	left,
	width,
	template,
	div,
	onClick,
	readOnly,
}) {
	const {
		_id,
		tarif,
		date,
		duration,
		teacher,
		title,
		description,
		promotion,
		uf,
		deadline,
		author,
		sent,
		cancelled,
		// ONLY UI. Is this task overlaping another ? Cant be updated, read only
		overlapingTask,
	} = task;

	// Le code suivant permet d'éviter l'animation des watermark lorsque
	// les tâches apparaissent. L'animation ne se jouera qu'au changement
	//d'option d'animation ou de tarif de la tâche

	const [animateStore, setAnimateStore] = useState({
		animate: false,
		previousAnimationsPreference: store.user.animations,
		previousTarif: tarif,
	});

	useEffect(() => {
		if (
			tarif !== animateStore.previousTarif ||
			store.user.animations !== animateStore.previousAnimationsPreference
		) {
			console.log("changing !");
			setAnimateStore({
				animate: true,
				previousAnimationsPreference: store.user.animations,
				previousTarif: tarif,
			});
		}
	}, [store.user.animations, tarif]);
	const displayDuration = deadline ? 15 : duration;

	let validated, signed, cdc, signingDate, signingDateString;

	if (store.cdcs) {
		cdc = store.cdcs.find((c) => c.tasks.includes(_id));

		if (cdc) {
			validated = true;
		}

		if (store.contrats && cdc) {
			const contrat = store.contrats.find(
				(contrat) =>
					contrat.cdcs.includes(cdc._id) &&
					Boolean(contrat.signingDate)
			);

			if (contrat) {
				signed = true;
				signingDate = contrat.signingDate;

				if (signingDate) {
					signingDateString = signingDate.toLocaleDateString("fr", {
						weekDay: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					});
				}
			}
		}
	}

	// Recherche des infos sur le tarif et le type /////////////////////////////////////////////////////////////////
	let type, typeSigle, typeName, color;

	const TwoDecimal = (num) =>
		Math.round(num) !== num
			? (Math.round(num * 100) / 100).toFixed(2)
			: num;

	const tarifObject = store.tarifs.find((t) => t._id === tarif);

	if (tarifObject) {
		type = store.types.find((type) => type._id === tarifObject.type);
	}

	if (type) {
		typeSigle = type.sigle;
		typeName = type.name;
		color = type.color;
	}

	const authorObject = store.users.find((u) => u._id === author);

	// Sécurité //////////////////////////////////////
	// On ne peut éditer une tâche que si on l'a nous même créé,
	// ou si on gère la compétence à laquelle elle est rattachée
	const locked =
		overlapingTask ||
		!(
			store.userSkills.some((uSkill) => uSkill._id == task.uf) ||
			task.author === store.user._id
		);

	const canEdit =
		!readOnly &&
		!locked &&
		(!sent || signed) &&
		(!validated || signed) &&
		!template &&
		!overlapingTask &&
		!store.planning;

	// SIGLE DE LA COMPETENCE /////////////////////////////////////////////////////

	const skill = store.skills.find((sk) => sk._id === uf);
	let skillSigle;

	if (skill) {
		skillSigle = skill.sigle;
	}

	////////////////////////////////////////////////////////////////////////////////////

	let teacherObject;
	let teacherString = "";
	if (teacher) {
		teacherObject = store.vacataires.find((v) => v._id === teacher);

		if (teacherObject) {
			teacherString =
				(teacherObject.nom
					? teacherObject.nom.toUpperCase() + " "
					: "") +
				teacherObject.prenom +
				(teacherObject.metier ? " - " + teacherObject.metier : "");
		}
	}

	const promoString =
		promotion && promotion.length > 0
			? store.promotions
					.filter((p) => promotion.includes(p._id))
					.map((p, i, a) => p.name + (i !== a.length - 1 ? " " : ""))
			: "Ø";

	const minutes = duration % 60;
	const hours = (duration - minutes) / 60;

	return (
		<div
			className={`Task${className ? " " + className : ""}${
				type ? " " + typeSigle : ""
			}${
				_id === store.editor || store.editing === _id ? " edition" : ""
			}${store.doing === CA.LINK_MODAL ? " link" : ""}${
				displayDuration <= 15 && !template ? " d15" : ""
			}${displayDuration <= 30 && !template ? " d30" : ""}${
				displayDuration <= 45 && !template ? " d45" : ""
			}${displayDuration <= 60 && !template ? " d60" : ""}${
				displayDuration <= 75 && !template ? " d75" : ""
			}${displayDuration <= 90 && !template ? " d90" : ""}${
				displayDuration <= 105 && !template ? " d105" : ""
			}${displayDuration <= 120 && !template ? " d120" : ""}${
				div ? ` div${div >= 0.14 ? "1" : div >= 0.1 ? "2" : "3"}` : ""
			}${template ? " template" : ""}${
				store.editing === _id && store.doing === CA.TASK.CLONE.DRAG
					? " clone"
					: ""
			}${store.user.darkTheme ? " dark" : ""}${
				!canEdit || (template && !onClick) ? " locked" : ""
			}${overlapingTask ? " overlapingTask" : ""}${
				deadline ? " deadline" : ""
			}${type && type.planning ? " planning" : ""}${
				cancelled ? " cancelled" : ""
			}`}
			style={{
				height: "calc(" + String(height) + "% - 3px)",
				top: "calc(" + String(top) + "% + 2px)",
				width: "calc(" + String(width) + "% - 3px)",
				left: "calc(" + String(left) + "% + 2px)",
			}}
			draggable={false}
			onMouseUp={(event) => {
				event.stopPropagation();
				if (canEdit) {
					dispatch({ type: TASK.MOUSE_UP, event, data: _id });
				}
			}}
			onMouseDown={(event) => {
				event.stopPropagation();
				if (canEdit) {
					dispatch({ type: TASK.MOUSE_DOWN, event, data: _id });
				}
			}}
			onClick={(event) =>
				template && onClick ? onClick(event) : () => false
			}
			title={`Créé par ${
				authorObject && authorObject.prenom
					? authorObject.prenom + " "
					: ""
			}${authorObject && authorObject.nom ? authorObject.nom : ""}${
				authorObject && authorObject.email
					? " <" + authorObject.email
					: ""
			}>\n${title ? `\nIntitulé : ${title}.` : ""}${
				typeName && typeSigle
					? `\nType: ${typeName} (${typeSigle}).`
					: ""
			}${
				duration
					? `\n${
							deadline ? "Nombre d'heures" : "Durée"
					  } : ${hours}h${formatNumber(minutes)}`
					: ""
			}${skillSigle ? `\nCompétence : ${skillSigle}.` : ""}${
				teacherString ? `\nProfesseur : ${teacherString}.` : ""
			}\nPromotion${promotion.length > 1 ? "s" : ""} : ${promoString}.${
				description ? `\nContenu : ${description}.` : ""
			}${signingDateString ? `\n\nSigné le ${signingDateString}.` : ""}`}
		>
			<>
				<div
					className={`background${
						store.user.darkTheme ? " dark" : ""
					}${animateStore.animate ? " animate" : ""}`}
					style={{ backgroundColor: color }}
				>
					<div className="watermark">
						<TransitionGroup className="watermarkGroup">
							{store.user.animations &&
								type &&
								[-3, -2, -1, 0, 1, 2, 3].map((t) => (
									<CSSTransition
										key={`${t} ${typeSigle}`}
										timeout={1000}
										classNames="watermarkTransition"
										appear
									>
										<p
											style={{
												left: Math.cos(t) * 10 + "rem",
												top: `${t * 10 - 5}rem`,
											}}
											className={
												t % 2 === 0 ? "even" : "odd"
											}
										>
											{[]
												.concat(
													store.mode === 1
														? [1, 2, 3, 4, 5]
														: [1, 2]
												)
												.map((text) => (
													<React.Fragment
														key={`${t} ${typeSigle} ${text}`}
													>
														{typeName}{" "}
													</React.Fragment>
												))}
										</p>
									</CSSTransition>
								))}
						</TransitionGroup>
					</div>
					{!store.planning && !readOnly ? (
						cancelled ? (
							<FontAwesomeIcon
								icon={faWindowClose}
								className="lockIcon"
							/>
						) : signed ? (
							<FontAwesomeIcon
								icon={faPenNib}
								className="lockIcon"
							/>
						) : validated ? (
							<FontAwesomeIcon
								icon={faCheck}
								className="lockIcon"
							/>
						) : sent ? (
							<FontAwesomeIcon
								icon={faPaperPlane}
								className="lockIcon"
							/>
						) : locked ? (
							<FontAwesomeIcon
								icon={faLock}
								className="lockIcon"
							/>
						) : (
							""
						)
					) : (
						""
					)}
				</div>

				{/*store.links.some((link) => link.items.includes(id)) && (
					<FontAwesomeIcon className="linkIcon" icon={faLink} />
				)*/}

				<div className="titleRowTask">
					<p className="Title" key={title}>
						{type && (
							<span>
								{typeSigle}
								{" - "}
							</span>
						)}

						{title ? title : "(sans titre)"}
					</p>

					{!store.planning &&
						!readOnly &&
						teacherObject &&
						teacherObject.statut &&
						teacherObject.statut >= 3 &&
						tarifObject &&
						!locked &&
						!cancelled &&
						!signed &&
						!validated &&
						!sent &&
						!locked && (
							<span
								className="tarif"
								style={{
									color: color ? color : "hsl(0,0%,50%)",
								}}
							>
								{teacherObject.statut === 4
									? `${TwoDecimal(
											(tarifObject.ctu * duration) / 60
									  )}€`
									: teacherObject.statut === 3
									? `${TwoDecimal(
											(tarifObject.prestation *
												duration) /
												60
									  )}€`
									: ""}
							</span>
						)}
				</div>
				<div className="taskMain">
					<p className="infos">
						{promoString && (
							<span>
								{promoString}
								{" - "}
							</span>
						)}
						<span>{skillSigle}</span>
					</p>

					<span className="teacher">
						<FontAwesomeIcon icon={faChalkboardTeacher} />
						{teacherString ? " - " + teacherString : ""}
					</span>

					{date && (
						<>
							<Date date={date} long={template || div === 1} />

							<HourRange
								date={date}
								duration={duration}
								deadline={deadline}
							/>
						</>
					)}

					<Duration duration={duration} />

					{children && children}
				</div>

				{!deadline && canEdit && !signed && (
					<>
						<div
							className="sizer szTop"
							onMouseDown={(event) =>
								dispatch({
									type: TASK.MOUSE_DOWN_SIZER_TOP,
									event,
									data: _id,
								})
							}
						/>
						<div
							className="sizer szBtm"
							onMouseDown={(event) =>
								dispatch({
									type: TASK.MOUSE_DOWN_SIZER_BOTTOM,
									event,
									data: _id,
								})
							}
						/>
					</>
				)}
			</>
		</div>
	);
}

function areArrayEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	const aA = [...a].sort();
	const aB = [...b].sort();

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}

	return true;
}

function isEqual(p, n) {
	return (
		p.store.user.animations === n.store.user.animations &&
		p.height === n.height &&
		p.left === n.left &&
		p.top === n.top &&
		p.task.title === n.task.title &&
		p.task.teacher === n.task.teacher &&
		p.task.type === n.task.type &&
		p.task.deadline === n.task.deadline &&
		areArrayEqual(p.task.promotion) &&
		areArrayEqual(p.task.group) &&
		areArrayEqual(p.task.uf)
	);
}

export default React.memo(Task, isEqual);
