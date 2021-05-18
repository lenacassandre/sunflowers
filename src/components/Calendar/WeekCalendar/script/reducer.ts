import { StoreType } from './store';
import { Actions } from './actions'
import { BaseTaskType, CalendarConfig, OnDelete, OnPatch, OnPatchLazy, OnPost } from '../../Calendar';
import randomId from '../../../../utils/randomId'
import { strictEqual } from 'assert';
import { cloneElement } from 'react';

// TODO : enlever les @ts-ignore, normalement TS va avoir une mise à jour corrigeant tous les bugs qui m'ont obligé à mettre ces tags

/////////////////////////////////////////////////////////////////////////////////////////////////
const reducer = <TaskType extends BaseTaskType, IdKey extends keyof TaskType, Action extends keyof Actions<TaskType, IdKey>>(
	store: StoreType<TaskType, IdKey>,
	type: Action,
	action: Actions<TaskType, IdKey>[Action],
	config: CalendarConfig<TaskType, IdKey>,
	tasks: TaskType[],
	dispatch: <Action extends keyof Actions<TaskType, IdKey>>(type: keyof Actions<TaskType, IdKey>, action: Actions<TaskType, IdKey>[Action]) => void,
    onPost?: OnPost<TaskType, IdKey>,
    onPatch?: OnPatchLazy<TaskType>,
    onDelete?: OnDelete<TaskType>,
): Partial<StoreType<TaskType, IdKey>> | void => {
	if(type !== "mousemove_grid") {
		//console.log("ACTION", type, action)
	}

	switch (type) {
		default: return;

		case "changeId": {
			//@ts-ignore
			if(store.editing === action.oldId) {
				//@ts-ignore
				return { editing: action.newId }
			}

			return
		}

		case "close_editor": {
			return {
				editing: null,
				editor: "close",
				clickDate: null,
				clickTask: null,
				mouseAction: null
			}
		}

		case "mousedown_filter": {
			return {
				editing: null,
				editor: "close",
				clickDate: null,
				clickTask: null,
				mouseAction: null
			}
		}

		/////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////
		// MOUSE DOWN ON THE GRID
		case "mousedown_grid": {
			//@ts-ignore
			const event = action.event as React.MouseEvent

			// Check if the event comes from the calendar grid
			//@ts-ignore
			if(event.target.id !== "grid") return

			//@ts-ignore
			if(!action.date) return console.error("mousedown. Aucune date.");


			const temp_id = <unknown>randomId() as TaskType[IdKey];

			// Will change the id of the task when the server send a UID
			const forwardId = (newId: TaskType[IdKey]) => {
				dispatch("changeId", {oldId: temp_id, newId})
			}

			if(onPost) {
				// Call onPost event, and waiting for the frowardId callback to be called.
				const newTask = onPost(
					//@ts-ignore
					{
						[config.idKey]: temp_id,
						//@ts-ignore
						date: action.date,
						duration: config.step,
					},
					forwardId
				);

				if(newTask) {
					addClassToBody("resize"); // la classe grabbing permet d'avoir le cursor grab

					return {
						//@ts-ignore
						clickDate: new Date(action.date),
						clickTask: newTask,
						editing: temp_id,
						mouseAction: "creating",
						editor: "close",
					}
				}
			}

			return
		}

		/////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////
		// MOUSE DOWN ON A TASK
		case "mousedown_top":
		case "mousedown_mid":
		case "mousedown_bot": {
			//@ts-ignore
			const event = action.event as React.MouseEvent

			// Check if the event comes from a task container
			//@ts-ignore
			if(event.target.className !== "eventListener top" && event.target.className !== "eventListener mid" && event.target.className !== "eventListener bot") return

			// @ts-ignore
			if(!action.taskId) return console.error("action.taskID undefined");

			if(type === "mousedown_top" || type === "mousedown_bot") // Ajoute la classe grabbing à ce moment pour les eventListenenr top et bot. Mid le rajoute plus tard, quand on est sûr que l'utilisateur est bien en train de drag, et non de cliquer.
				addClassToBody("resize"); // la classe grabbing permet d'avoir le cursor grab

			//@ts-ignore
			const clickedTask = tasks.find(task => task[config.idKey] === action.taskId);

			if(!clickedTask) return console.error("clickedTask undefined");

			return {
				//@ts-ignore
				editor: action.taskId === store.editing ? store.editor : store.editor === "open" ? "changing" : "close",
				//@ts-ignore
				editing: action.taskId,
				lastEdited: store.editing,
				clickTask: {...clickedTask},
				mouseAction: type === "mousedown_top" ? "drag_top" : type === "mousedown_mid" ? "down_mid" : "drag_bot"
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////
		// MOUSE MOVE
		case "mousemove_grid": {
			// Erreurs
			//@ts-ignore
			if(!action.date) return console.error("action.date undefined");
			if(!store.editing) return;
			if(!store.clickTask) return;
			if(!store.mouseAction) return;

			switch(store.mouseAction) {
				default: return;
				//////////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOVE AFTER HAVING PRESSED CLONE BUTTON
				case "down_clone": {
					// @ts-ignore
					if(!store.clickDate) return {clickDate: action.date}

					// @ts-ignore
					if(store.clickDate.getTime() !== action.date?.getDate()) {
						const temp_id = <unknown>randomId() as TaskType[IdKey];

						const tempTask = {...store.clickTask, [config.idKey]: temp_id, ghost: true}

						const tempTaskStart = new Date(tempTask.date);
						tempTaskStart.setMinutes(tempTaskStart.getMinutes() + (tempTask.duration / 2))

						return {
							tempTask: tempTask,
							mouseAction: "drag_clone",
							editing: temp_id,
							clickDate: tempTaskStart,
							editor: "close"
						}
					}

					return
				}

				////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOUSE AFTER HAVING STARTED TO MOVE A CLONE
				case "drag_clone": {
					console.log("MOUSE MOVE", "DRAG CLONE")
					if(!store.clickDate) return;

					if(store.tempTask) {
						//@ts-ignore
						const newDate = new Date(action.date);
						const clickDateMinutes = store.clickDate.getHours() * 60 + store.clickDate.getMinutes();
						const clickTaskMinutes = store.clickTask.date.getHours() * 60 + store.clickTask.date.getMinutes();
						newDate.setMinutes(newDate.getMinutes() - (clickDateMinutes - clickTaskMinutes));

						///////////////////////////////////////////////////////////
						// Prevent drag before the day start
						if(newDate.getHours() < config.startHour) {
							newDate.setHours(config.startHour)
							newDate.setMinutes(0)
						}

						////////////////////////////////////////////////////////////
						// Prevent dragging after the day end
						const taskEndDate = new Date(newDate)
						taskEndDate.setMinutes((taskEndDate.getMinutes() + store.tempTask.duration))

						if(taskEndDate.getHours() >= config.endHour) {
							newDate.setHours(config.endHour);
							newDate.setMinutes(- store.tempTask.duration)
						}

						// Patch
						//@ts-ignore
						return {
							tempTask: {...store.tempTask, date: newDate}
						}
					}

					return
				}

				/////////////////////////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOVE WHILE CLICKING ON THE MIDDLE OF A TASK
				case "down_mid": {
					// @ts-ignore
					if(!store.clickDate) return {clickDate: new Date(action.date)}

					// @ts-ignore
					if(action.date.getTime() !== store.clickDate.getTime()) {
						addClassToBody("grabbing");

						return {
							mouseAction: "drag_mid"
						}
					}

					return {}
				}

				/////////////////////////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOVE DURING DRAGGING TASK
				case "drag_mid": {
					//@ts-ignore
					if(!store.clickDate) return {clickDate: action.date}

					// @ts-ignore
					let [taskToPatch, delta] = getTaskAndDelta(tasks, config, store, action, store.clickDate);

					if(taskToPatch) {

						//@ts-ignore
						const newDate = new Date(action.date);
						const clickDateMinutes = store.clickDate.getHours() * 60 + store.clickDate.getMinutes();
						const clickTaskMinutes = store.clickTask.date.getHours() * 60 + store.clickTask.date.getMinutes();
						newDate.setMinutes(newDate.getMinutes() - (clickDateMinutes - clickTaskMinutes));

						///////////////////////////////////////////////////////////
						// Prevent drag before the day start
						if(newDate.getHours() < config.startHour) {
							newDate.setHours(config.startHour)
							newDate.setMinutes(0)
						}

						////////////////////////////////////////////////////////////
						// Prevent dragging after the day end
						const taskEndDate = new Date(newDate)
						taskEndDate.setMinutes((taskEndDate.getMinutes() + taskToPatch.duration))

						if(taskEndDate.getHours() >= config.endHour) {
							newDate.setHours(config.endHour);
							newDate.setMinutes(- taskToPatch.duration)
						}

						// Patch
						//@ts-ignore
						onPatch(taskToPatch, {date: newDate})
					}

					return
				}

				/////////////////////////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOVE DURING DRAGGING TASK TOP
				case "drag_top": {
					// @ts-ignore
					let [taskToPatch, delta] = getTaskAndDelta(tasks, config, store, action);

					if(taskToPatch) {
						const newDate = new Date(store.clickTask.date);
						let newDuration = taskToPatch.duration;

						// La date change //////////////////////////////////////////////////////////
						if(delta < store.clickTask.duration) {
							newDate.setMinutes(newDate.getMinutes() + delta)

							newDuration = store.clickTask.duration - delta;

							if(taskToPatch.duration !== newDuration || taskToPatch.date.getTime() !== newDate.getTime()) {
								onPatch && onPatch(taskToPatch, {date: newDate, duration: newDuration});
							}
						}
						// La durée change ///////////////////////////////////////////////////////////
						else {
							newDate.setMinutes(newDate.getMinutes() + store.clickTask.duration - config.step);

							newDuration = delta - store.clickTask.duration + config.step * 2;
						}

						// PATCH
						if(taskToPatch.duration !== newDuration || taskToPatch.date.getTime() !== newDate.getTime()) {
							onPatch && onPatch(taskToPatch, {duration: newDuration, date: newDate});
						}
					}

					return
				}

				/////////////////////////////////////////////////////////////////////////////////////////////////////////:
				// MOUSE MOVE DURING DRAGGING TASK BOTTOM OR DRAGGIN AFTER CREATION
				case "creating":
				case "drag_bot": {
					// @ts-ignore
					let [taskToPatch, delta] = getTaskAndDelta(tasks, config, store, action);

					if(taskToPatch) {
						const newDate = new Date(store.clickTask.date);
						let newDuration = 0;

						// Durée positive : la date ne change pas //////////////////////////////////////////////////////////
						if(delta > 0) {
							newDuration = delta + config.step;
						}
						// Durée négative : la date change ///////////////////////////////////////////////////////////
						else {
							newDate.setMinutes(newDate.getMinutes() + delta);
							newDuration = (delta * -1) + config.step;
						}

						// PATCH
						if(taskToPatch.duration !== newDuration || taskToPatch.date.getTime() !== newDate.getTime()) {
							onPatch && onPatch(taskToPatch, {date: newDate, duration: newDuration});
						}
					}

					return
				}
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////
		// MOUSE UP ON A TASK
		case "mouseup_task": {
			removeClassFromBody("resize"); // la classe resize permet d'avoir le cursor resize
			removeClassFromBody("grabbing"); // la classe grabbing permet d'avoir le cursor grab

			lazyPatch(tasks, config, store, onPatch)

			// Mouse up sur la même task que celle sur laquelle on a mouse down
			//@ts-ignore
			if(action.taskId === store.editing) {
				// Si l'éditeur esst ouvert
				if(store.editor === "open") {
					return {
						clickDate: null,
						lastEdited: null,
						editor: store.mouseAction !== "down_mid" ? "open" : "close",
						editing: store.mouseAction !== "down_mid" ? store.editing : null,
						mouseAction: null,
					}
				}
				// Mouse up after pressing clone
				else if(store.mouseAction === "down_clone" && store.clickTask) {
					const temp_id = <unknown>randomId() as TaskType[IdKey];

					// Will change the id of the task when the server send a UID
					const forwardId = (newId: TaskType[IdKey]) => {
						dispatch("changeId", {oldId: temp_id, newId})
					}

					if(onPost) {
						// Call onPost event, and waiting for the frowardId callback to be called.
						const newTask = onPost({...store.clickTask, [config.idKey]: undefined}, forwardId)

						return {
							//@ts-ignore
							clickDate: new Date(action.date),
							clickTask: null,
							editing: temp_id,
							mouseAction: null,
							editor: "open",
						}
					}
				}
				else if(store.mouseAction === "drag_clone" && store.tempTask) {
					const temp_id = store.tempTask[config.idKey];

					// Will change the id of the task when the server send a UID
					const forwardId = (newId: TaskType[IdKey]) => {
						dispatch("changeId", {oldId: temp_id, newId})
					}

					if(onPost) {
						// Call onPost event, and waiting for the frowardId callback to be called.
						const newTask = onPost(store.tempTask, forwardId);

						return {
							mouseAction: null,
							editing: null,
							tempTask: null,
							clickDate: null,
							clickTask: null
						}
					}
				}
				// Si l'éditeur est fermé ou en train de changer de task
				else {
					// mouse up after creation
					if(store.mouseAction === "creating") {
						return {
							editor: "open",
							mouseAction: null
						}
					}
					else {
						return {
							clickDate: null,
							lastEdited: null,
							editor: store.mouseAction === "down_mid" ? "open" : "close",
							editing: store.mouseAction === "down_mid" ? store.editing : null,
							mouseAction: null,
						}
					}
				}
			}
			else {
				return {
					clickDate: null,
					lastEdited: null,
					editing: null,
					mouseAction: null,
				}
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////
		// MOUSE UP ON THE GRID
		case "mouseup_grid": {
			removeClassFromBody("resize"); // la classe resize permet d'avoir le cursor resize
			removeClassFromBody("grabbing"); // la classe grabbing permet d'avoir le cursor grab

			lazyPatch(tasks, config, store, onPatch)

			// mouse up after creating
			if(store.mouseAction === "creating") {
				return {
					editor: "open",
					mouseAction: null
				}
			}
			// Mouse up after pressing clone
			else if(store.mouseAction === "down_clone" && store.clickTask) {
				const temp_id = <unknown>randomId() as TaskType[IdKey];

				// Will change the id of the task when the server send a UID
				const forwardId = (newId: TaskType[IdKey]) => {
					dispatch("changeId", {oldId: temp_id, newId})
				}

				if(onPost) {
					// Call onPost event, and waiting for the frowardId callback to be called.
					const newTask = onPost({...store.clickTask, [config.idKey]: undefined}, forwardId)

					return {
						//@ts-ignore
						clickDate: new Date(action.date),
						clickTask: null,
						editing: temp_id,
						mouseAction: null,
						editor: "open",
					}
				}
			}
			else if(store.mouseAction === "drag_clone" && store.tempTask) {
				const temp_id = store.tempTask[config.idKey];

				// Will change the id of the task when the server send a UID
				const forwardId = (newId: TaskType[IdKey]) => {
					dispatch("changeId", {oldId: temp_id, newId})
				}

				if(onPost) {
					// Call onPost event, and waiting for the frowardId callback to be called.
					const newTask = onPost(store.tempTask, forwardId);

					return {
						mouseAction: null,
						editing: null,
						tempTask: null,
						clickDate: null,
						clickTask: null
					}
				}
			}
			else {
				return {
					clickDate: null,
					clickTask: null,
					lastEdited: store.editing,
					editing: store.editor === "open" ? store.editing : null, // Si l'éditeur n'est pas ouvert, editing = null
					mouseAction: null,
				}
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////

		// FEATURES

		// CLONE
		case "mousedown_clone": {
			return {
				mouseAction: "down_clone",
				//@ts-ignore
				clickTask: action.task,
			}
		}
	}
}

export default reducer;

/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/
/*********************************************************************************************************************/

/**
 * TODO: documenter cette fonction
 */
function lazyPatch<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(
	tasks: TaskType[],
	config: CalendarConfig<TaskType, IdKey>,
	store: StoreType<TaskType, IdKey>,
	onPatch?: OnPatchLazy<TaskType>
) {
	const taskToPatch = tasks.find(task => task[config.idKey] === store.editing);

	if(
		onPatch &&
		config.lazyPatch &&
		store.mouseAction &&
		store.clickTask &&
		taskToPatch &&
		(
			store.clickTask.date.getTime() !== taskToPatch.date.getTime() ||
			store.clickTask.duration !== taskToPatch.duration
		)
	) {
		onPatch(taskToPatch, {date: taskToPatch.date, duration: taskToPatch.duration}, true)
	}
}

function addClassToBody(className: string) {
	if(!document.body.className.includes(className)) {
		document.body.className += " " + className;
	}
}

function removeClassFromBody(className: string) {
	if(document.body.className.includes(className)) {
		document.body.className = document.body.className.replace(" " + className, "")
	}
}

/**
 * Return:
 * - the task to update,
 * - the difference (delta) in minutes between the date of the task the before the mousedown, and the date of the cursor in the calendar
 * @param tasks
 * @param config
 * @param store
 * @returns
 */
function getTaskAndDelta<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(
	tasks: TaskType[],
	config: CalendarConfig<TaskType, IdKey>,
	store: StoreType<TaskType, IdKey>,
	action: {date: Date},
	clickDate?: Date
): [TaskType | null, number] {
	// CHECK ARGUMENTS ////////////////////////////////////////////////////////////////////////////
	if(!store.editing){
		console.error("store.editing undefined");
		return [null, 0]
	}

	clickDate ||= store.clickTask?.date

	if(!clickDate){
		console.error("clickDate undefined");
		return [null, 0]
	}


	if(!action.date){
		console.error("action.date undefined");
		return [null, 0]
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////

	const taskToPatch = tasks.find(t => t[config.idKey] === store.editing); // La task qui doit être modifiée

	if(!taskToPatch){
		console.error("tackToPatch undefined");
		return [null, 0]
	}

	const clickMinutes = clickDate.getHours() * 60 + clickDate.getMinutes();
	//@ts-ignore
	const mouseMinutes = action.date.getHours() * 60 + action.date.getMinutes();

	// La nouvelle durée (peut être positive)
	let delta = mouseMinutes - clickMinutes;

	return [taskToPatch, delta];
}