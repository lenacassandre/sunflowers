import { BaseTaskType } from "../../Calendar";

export type StoreType<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = {
    clickDate: Date | null, // The date on the calendar where mouse was down the last time
    clickTask: TaskType | null, // The state of task at the moment of the click
    editor: "close" | "open" | "changing", // is the editor open ?
    editing:  TaskType[IdKey] | null, // The id of the task being edited
    mouseAction: "drag_top" | "drag_mid" | "drag_bot" | "down_mid" | "creating" | "down_clone" | "drag_clone" | null,
    message: string,
    firstDayOfTheWeek: Date | null;
    lastEdited: TaskType[IdKey] | null, // la dernière task dont on a finit l'édition, pour des question d'animation
    tempTask: (TaskType & {ghost: boolean}) | null, // Un tâche temporaire qui peut servir à la feature de clone
}

const store: StoreType<any, any> = {
    clickDate: null,
    clickTask: null,
    editor: "close",
    editing: null,
    mouseAction: null,
    message: "",
    lastEdited: null,
    firstDayOfTheWeek: null,
    tempTask: null
};

export default store
