import React from "react";
import { BaseTaskType } from "../../Calendar";

export type Actions<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = {
    // GRID
    "mousedown_grid": { // mouse down on the grid
        date: Date,
        event: React.MouseEvent
    },
    "mousemove_grid": {
        date: Date
    },
    "mouseup_grid": {
        date: Date
    },
    // TASKS
    "mousedown_top": { // mouse down on the top of a task
        taskId: TaskType[IdKey],
        event: React.MouseEvent
    },
    "mousedown_mid": { // mouse down on the middle of a task
        taskId: TaskType[IdKey],
        event: React.MouseEvent
    },
    "mousedown_bot": { // mouse down on the bottom of a task
        taskId: TaskType[IdKey],
        event: React.MouseEvent
    },
    "mouseup_task": { // mouse up on a task
        taskId: TaskType[IdKey]
    },
    "mousedown_filter": {},
    "close_editor": {},

    "changeId" : { // Lorsque l'id d'une task est sauvegardé car le serveur a envoyé sa réponse
        oldId: TaskType[IdKey],
        newId: TaskType[IdKey],
    },

    //FEATURES

    // Clone
    "mousedown_clone" : {
        task: TaskType
    },
}