import React from 'react';
import "./Calendar.scss";
import { MonthCalendar } from './MonthCalendar/MonthCalendar';

import {WeekCalendar} from './WeekCalendar/WeekCalendar'

export declare type BaseTaskType = {
    date: Date;
    duration: number; // if 0 : c'est un évènement affiché mais qui ne dure pas dans le temps
    deadline?: boolean; // if true, the task will be displayed as if it has 0 duration
}

export declare type OnPost<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = (newTask: Partial<TaskType> & BaseTaskType, forwardId: (newId: TaskType[IdKey]) => void) => TaskType | void;
export declare type OnPatch<TaskType extends BaseTaskType> = (task: TaskType, patch: {date: Date} | {duration: number} | {date: Date, duration: number}) => void;
export declare type OnPatchLazy<TaskType extends BaseTaskType> = (task: TaskType, patch: {date: Date} | {duration: number} | {date: Date, duration: number}, send?: boolean) => void;
export declare type OnDelete<TaskType extends BaseTaskType> = (task: TaskType) => void;

/**
 * @argument task : Task object sent to the calendar
 * @argument config : Config object processed by the Calendar
 * @argument rect : Informations about the position and size of the task container
 * @argument innerRatio : Size of the task in the day (between 0 and 1)
 */
export declare type RenderTask<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = React.FC<{
    task: TaskType,
    config: CalendarConfig<TaskType, IdKey>,
    rect: {left: number, top: number, width: number, height: number},
}>

/**
 * @argument task : Task object sent to the calendar
 * @argument config : Config object processed by the Calendar
 * @argument rect : Informations about the position and size of the task container
 * @argument innerRatio : Size of the task in the day (between 0 and 1)
 */
 export declare type RenderEditor<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = React.FC<{
    task: TaskType,
    config: CalendarConfig<TaskType, IdKey>,
    rect: {left: number, top: number, width: number, height: number},
    post?: OnPost<TaskType, IdKey>,
    patch?: OnPatchLazy<TaskType>,
    delete?: OnDelete<TaskType>,
    close: () => void,
    clone: () => void,
}>

/**
 *  @property startHour - Début de la journée en affichage semaine.
 *  @property endHour - Fin de lajournée en affichage semaine.
 *  @property step - Step in minutes, la précision des heures.
 *  @property displayMode
 *  @property day - Le premier jour à afficher en mode semaine. En mode mois, ça affiche tout le mois du jour donné.
 *  @property days - En mode semaine, le nombre de jour à afficher à partir du jour donné (day)
 *  @property dayWidth - Entre 0 et 100, en %. Détermine la place que prennent les tâches dans une colonne de jour. Uniquement en affichage semaine.
 *  @property minimumDuration - La taille par défaut des tâches. Toutes tâche ayant une durée inférieur sera affichée comme ayant cette durée.
 *  @property flex - Si les tâches qui en ont la place s'agrandissent. Prend plus de temps de calcul
 */
export declare type CalendarConfig<TaskType extends BaseTaskType, IdKey extends keyof TaskType> = {
    startHour: number; // Début de la journée en affichage semaine.
    endHour: number; // Fin de lajournée en affichage semaine.
    step: number; // Step in minutes, la précision des heures.
    displayMode: "week" | "month";
    day: Date; // Le premier jour à afficher en mode semaine. En mode mois, ça affiche tout le mois du jour donné.
    days: number; // En mode semaine, le nombre de jour à afficher à partir du jour donné (day)
    dayWidth: number; // Entre 0 et 100, en %. Détermine la place que prennent les tâches dans une colonne de jour. Uniquement en affichage semaine.
    minimumDuration: number; // La taille par défaut des tâches. Toutes tâche ayant une durée inférieur sera affichée comme ayant cette durée.
    flex: boolean; // Si les tâches qui en ont la place s'agrandissent. Prend plus de temps de calcul
    idKey: IdKey; // L'id permet d'identifier les tasks. Indispensable, mais par défaut égal à "_id" pour fonctionner avec automaton
    highlightDraggedTask: boolean; // When a task is dragged, it will be displayed on top of others, and take the total width of a day
    highlightPadding: number; // padding in px for the currently drag task
    ghost: boolean; // Show the previous state of the currently dragged task
    lazyPatch: boolean; // Does the onPatch event is dispatched whenever a change is done, or when the changes are finished ? true = wait, false = dispatch each time.
    focusLayer: boolean; // Display focus layer ? Focus layer is display behind the currently edited task, and above other tasks. Its style can be edited, and it change some clicks behaviors.
    firstDayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    deadlineDurationReplacer: number; // La durée que doit prendre en compte le calendrier pour afficher une tâches qui n'a techniquement pas de durée
    weekday: boolean // Display week day in week mode
    dayNumber: boolean // Display day number
    enableEditor: boolean // Display editor
}

////////////////////////////////////////////////////////////////////////////////////////////////////
export function Calendar<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    tasks: TaskType[];
    config?: Partial<CalendarConfig<TaskType, IdKey>>;

    onPost?: OnPost<TaskType, IdKey>;
    onPatch?: OnPatch<TaskType>;
    onDelete?: OnDelete<TaskType>;

    onClick?: (task: TaskType) => void;

    lock?: (task: TaskType) => boolean;

    renderWeekTask: RenderTask<TaskType, IdKey>
    renderEditor?: RenderEditor<TaskType, IdKey>
}) {
    // DEFAULT CONFIG ///////////////////////////////////////////////////////////////////////////////
    const config: Partial<CalendarConfig<TaskType, IdKey>> = props.config || {};
    config.displayMode ||= "week";
    config.startHour ||= 0;
    config.endHour ||= 24;
    config.day ||= new Date();
    config.days ||= 7;
    config.step ||= 15;
    config.dayWidth ||= 90;
    config.minimumDuration ||= 15;
    config.flex ||= false;
    config.idKey ||= "_id" as IdKey;
    config.highlightDraggedTask = config.highlightDraggedTask === false ? false : true;
    config.highlightPadding ||= 1;
    config.ghost = config.ghost === false ? false : true;
    config.lazyPatch = config.lazyPatch === false ? false : true;
    config.focusLayer = config.focusLayer === false ? false : true;
    config.firstDayOfWeek ||= "monday";
    config.deadlineDurationReplacer ||= 15;
    config.weekday = config.weekday === false ? false : true;
    config.dayNumber = config.dayNumber === false ? false : true;
    config.enableEditor ||= false;

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <div className="Calendar">
            {
                config?.displayMode === "week"
                ? (
                    <WeekCalendar<TaskType, IdKey>
                        config={config as CalendarConfig<TaskType, IdKey>}
                        tasks={props.tasks}

                        onPost={props.onPost}
                        onPatch={props.onPatch}
                        onDelete={props.onDelete}

                        onClick={props.onClick}
                        lock={props.lock}

                        renderWeekTask={props.renderWeekTask}
                        renderEditor={props.renderEditor}
                    />
                )
                : (
                    <MonthCalendar<TaskType, IdKey>
                        config={config as CalendarConfig<TaskType, IdKey>}
                        tasks={props.tasks}

                        onPost={props.onPost}
                        onPatch={props.onPatch}
                        onDelete={props.onDelete}

                        onClick={props.onClick}
                        lock={props.lock}
                    />
                )
            }
        </div>
    )
}