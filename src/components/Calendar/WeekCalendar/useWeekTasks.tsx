import React from "react";
import { CSSTransition } from "react-transition-group";
import { BaseTaskType, CalendarConfig, OnDelete, OnPatchLazy, OnPost, RenderEditor, RenderTask } from "../Calendar";
import { Actions } from "./script/actions";
import { StoreType } from "./script/store";
import {TaskContainer} from './TaskContainer/TaskContainer'
import {Editor} from './Editor/Editor'
// TODO: se servir de useEffect et useState pour encore optimiser le calcul
// Par exemple, on pourrait éviter de recréer le tableau des jours (days) à chaque fois,
// et le recréer uniquement si certains paramètres de config changent.


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Return an array of absolutly positionned Task JSX Elements, from the tasks array and the config object.
export function useWeekTasks<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(
    tasks: TaskType[],
    config: CalendarConfig<TaskType, IdKey>,
    store: StoreType< TaskType, IdKey>,
    dispatch: <Action extends keyof Actions<TaskType, IdKey>>(type: Action, action: Actions<TaskType, IdKey>[Action]) => void,
    RenderWeekTask: RenderTask<TaskType, IdKey>,
    RenderEditor?: RenderEditor<TaskType, IdKey>,
    onPost?: OnPost<TaskType, IdKey>,
    onPatch?: OnPatchLazy<TaskType>,
    onDelete?: OnDelete<TaskType>
) {
    // Le premier jour de la journée doit d'abord avoir été trouvé par le calendrier
    if(!store.firstDayOfTheWeek) return []

    const dayDurationMinutes = (config.endHour - config.startHour) * 60; // Durée d'une journée
    const weekStartMinutes = config.startHour * 60; // LE début d'une journée, en minutes
    const delta = weekStartMinutes / dayDurationMinutes; // Décalage dans le calcul du positionnement horaire

    const dayWidth = 100 / config.days; // Largeur en % d'un jour
    const innerDayWidth = (1 / config.days) * config.dayWidth; // Largeur d'un jour [0 ; 1]


    let tasksArray: (TaskType & {ghost?: boolean})[] = [...tasks];

    let draggedTask: TaskType | undefined;


    // DRAGGED TASK
    // Si une task est en train d'être drag ou créée, et que la config contient le paramètre d'higlight, on supprime la tâche actuellement drag, pour la replacer plus tard, après les calculs qui suivent
    if(
        config.highlightDraggedTask // La config doit demander que cette feature soit active
        && (
            store.editing !== null// Il faut qu'un élément doit en train d'être édité
            && store.mouseAction !== null // et qu'une action à la souris soit en train d'être faite
        )
        || store.editor !== "close"
    ) {
        draggedTask = tasksArray.find(task => task[config.idKey] === store.editing);

        if(draggedTask) {
            tasksArray = tasksArray.filter(task => task[config.idKey] !== store.editing)
        }
    }

    // DRAGGING GHOST CLONNING TASK
    if(store.mouseAction === "drag_clone" && store.tempTask) {
        draggedTask = store.tempTask;
    }

    // GHOST TASK
    // Si une task est en train d'être drag, on rajoute on rajoute son fantôme à la liste, et on enlève la task en train d'être drag, qu'on rajoutera plus tard, car elle ne doit pas rentrer dans le calcul des colonnes. Nécessite ghost = true dans la config.
    if(
        config.ghost
        && store.clickTask
        && (
            store.mouseAction === "drag_top"
            || store.mouseAction === "drag_mid"
            || store.mouseAction === "drag_bot"
            || store.mouseAction === "down_mid"
        )
    ) {
        tasksArray = [
            ...tasksArray,
            {
                ...store.clickTask,
                ghost: true
            }
        ]
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////::
    // PART 1 : Filter tasks

    // Get the first hour to display
    const weekStart = new Date(store.firstDayOfTheWeek)
    weekStart.setHours(config.startHour);
    weekStart.setMinutes(0);
    weekStart.setSeconds(0);
    weekStart.setMilliseconds(0);

    // Get the last hour to display
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + config.days);
    weekEnd.setHours(config.endHour);

    // Tableau contenant toutes les tâches de la semaine, avec des informations de calcul supplémentaire
    const tasksContainersToDisplay: TaskContainer<TaskType>[] = [];

    // Get all the tasks to display, hiding those being outside [start ; end]
    // Le filtre est nécessaire pour limiter les calculs par la suite.
    // Si on a 1000 tâches sur une année mais qu'on ne compte afficher que les 50 de la semaine courante,
    // On limite les calculs suivant à 50 tâches, au lieu de 1000 sans le filtre.
    tasksArray.forEach(task => {
        if(!task.date) return;

        // Get the end date of the task. Start date being task.date.
        const taskEnd = new Date(task.date);
        // La durée est augmentée pour les tâches qui ont une durée plus petite que la durée minimum
        const duration = task.duration < config.minimumDuration ? config.minimumDuration : task.duration;
        taskEnd.setMinutes(taskEnd.getMinutes() + duration);

        // Si la tâche est dans la semaine, on l'ajoute au tableau
        if(overlap(task.date, taskEnd, weekStart, weekEnd)) {
            tasksContainersToDisplay.push({
                start: task.date,
                end: taskEnd,
                taskObject: task
            })
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////::
    // PART 2 : Sort tasks by date

    tasksContainersToDisplay.sort((taskContainerA, taskContainerB) =>
        taskContainerA.start.getTime() - taskContainerB.start.getTime() // Tri par date
        || taskContainerB.taskObject.duration - taskContainerA.taskObject.duration // Et si les dates sont les mêmes, tri par durée
    );

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // PART 3 : Create days array

    const days: Day<TaskType>[] = []

    for(let dayIndex = 0; dayIndex < config.days; dayIndex++) {
        // Get the first hour to display
        const dayStart = new Date(weekStart);
        dayStart.setDate(dayStart.getDate() + dayIndex);

        // Get the last hour to display
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(config.endHour);

        days.push({
            dayIndex, // Index du jour dans le position de la grille. [0 ; n]
            offset: dayWidth * dayIndex, // La position left dans la grille en %. [0 ; 100[
            start: dayStart, // Le début du jour
            end: dayEnd, // La fin du jour
            tasksContainers: [] // Les conteneurs positionnent la tâche, et appellent la fonction renderTask passée, en envoyant l'objet task
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // PART 4 : Filter tasks for each day

    // Pour toutes les tâches
    tasksContainersToDisplay.forEach(taskContainer => {

        // Pour tous les jours de la semaine
        daysLoop:for(let i = 0; i < days.length; i++) {

            // Si la tâche est dans le jour, on rajoute son conteneur au jour, et on casse la boucle.
            if(overlap(taskContainer.start, taskContainer.end, days[i].start, days[i].end)) {
                days[i].tasksContainers.push(taskContainer);
                break daysLoop;
            }
        }
    })

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // PART 5 : Position each task

    const positionnedTasksContainers: PositionnedTaskContainer<TaskType>[] = []

    days.forEach(day => {
        // DANS UN JOUR

        /////////////////////////////////////////////////////////////////////////////////////////////////
        // PART 5.1 : For each day, create overlaping regions

        // Toutes les overlaping regions. Qui permettent d'analyser simplement où les tâches se chevauchent.
        const overlapingRegions: OverlapingRegion<TaskType>[] = []

        day.tasksContainers.forEach(taskContainer => {
            // POUR UN CONTENEUR DE TACHE DE CE JOUR

            // Fonction qui crée une nouvelle overlaping region avec la task container.
            const pushNew = () => {
                overlapingRegions.push({
                    start: new Date(taskContainer.start),
                    end: new Date(taskContainer.end),
                    tasksContainers: [taskContainer]
                });
            }

            // Si aucune région n'est créé, on crée la première.
            if(overlapingRegions.length === 0) {
                pushNew()
                return;
            }

            // Essaie de trouver une overlaping region dont la tâche fait partie
            const overlapingRegion = overlapingRegions.find(OR => overlap(taskContainer.start, taskContainer.end, OR.start, OR.end));

            // Si aucune n'est trouvée, on en crée une nouvelle
            if(!overlapingRegion) {
                pushNew()
                return;
            }

            // Normalement, grâce à l'étape de tri et de durée, cette tâche ne peut pas se situer avant les autres de la région,
            // Mais forcément après, donc la nouvelle fin de la région est la fin de la tâche. Son début ne bouge pas.
            if(taskContainer.end.getTime() > overlapingRegion.end.getTime()) {
                overlapingRegion.end = new Date(taskContainer.end);
            }

            // On ajoute la tache à la région
            overlapingRegion.tasksContainers.push(taskContainer);
        })

        /////////////////////////////////////////////////////////////////////////////////////////////////
        // PART 5.2 : For each overlaping region, divide them by columns

        overlapingRegions.map(overlapingRegion => {
            /////////////////////////////////////////////////////////////////////////////////////////////////
            // PART 5.2.1 : Create columns

            // Tableau des colonnes de conteneurs de tâche qui composent le jour
            const columns: {start: Date; end: Date, tasksContainers: TaskContainer<TaskType>[]}[] = []

            overlapingRegion.tasksContainers.forEach(taskContainer => {
                // Pour chaque conteneur de tâche de la région

                // Cette fonction permet de push une nouvelle colonne contenant le taskContainer
                const pushNew = () => {
                    columns.push({
                        start: new Date(taskContainer.start),
                        end: new Date(taskContainer.end),
                        tasksContainers: [taskContainer]
                    });
                }

                // Si aucune colonne n'a été créée, on crée la première
                if(columns.length === 0) {
                    pushNew();
                    return;
                }

                // Trouve une colonne avec laquelle la tâche ne se chevauche pas
                const noOverlapColumn = columns.find(col => !overlap(taskContainer.start, taskContainer.end, col.start, col.end));

                // Si aucune n'a été trouvée, on en crée une nouvelle
                if(!noOverlapColumn) {
                    pushNew();
                    return;
                }

                // Normalement, grâce à l'étape de tri et de durée, cette tâche ne peut pas se situer avant les autres de la colonne,
                // Mais forcément après, donc la nouvelle fin de la colonne est la fin de la tâche. Son début ne bouge pas.
                noOverlapColumn.end = new Date(taskContainer.end);

                // On ajoute le conteneur de tache à la colonne.
                noOverlapColumn.tasksContainers.push(taskContainer);
            });

            /////////////////////////////////////////////////////////////////////////////////////////////////
            // PART 5.2.2 : Use columns to calculate position and size of each task container
            // And push the positionned containers in the positionnedTasksContainers array.

            columns.forEach((column, columnIndex) => {
                const columnWidth = innerDayWidth / columns.length;

                column.tasksContainers.forEach(taskContainer => {
                    const taskStartMinutes = taskContainer.start.getHours() * 60 + taskContainer.start.getMinutes();

                    const top = (taskStartMinutes / dayDurationMinutes - delta) * 100;

                    const duration = taskContainer.taskObject.deadline ? config.deadlineDurationReplacer : taskContainer.taskObject.duration;
                    const height = (duration / dayDurationMinutes) * 100;

                    // Positionnement X dans le jour
                    const innerLeft = columnWidth * columnIndex;
                    const left = day.offset + innerLeft;

                    const width = taskContainer.taskObject[config.idKey] === store.editing
                        && !taskContainer.taskObject.ghost
                            ? dayWidth
                            : columnWidth;

                    // Objet de contenur de tâche positionné dans la grille du calendrier
                    const positionnedTaskContainer = {
                        ...taskContainer,
                        left,
                        top,
                        width,
                        height
                    }

                    // Push the positionned task
                    positionnedTasksContainers.push(positionnedTaskContainer);
                })
            })
        })
    })

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // PART 6: Add the currently dragged task

    // If the highlight is enabled, push the currently dragged task
    if(draggedTask) {
        const taskStartMinutes = draggedTask.date.getHours() * 60 + draggedTask.date.getMinutes();

        const draggedTaskEnd = new Date(draggedTask.date);
        draggedTaskEnd.setMinutes(draggedTaskEnd.getMinutes() + draggedTask.duration);

        let dayIndex: number = 0;

        ////////////////////////////////////////////////////
        // FIND THE DRAGGED TASK DATE DAY INDEX IN THE WEEK
        const navigateDay = new Date(weekStart);

        for(let i = 0; i < config.days; i++) {
            dayIndex = i;

            if(
                navigateDay.getDate() === draggedTask.date.getDate()
                && navigateDay.getDate() === draggedTask.date.getDate()
                && navigateDay.getDate() === draggedTask.date.getDate()
            ) {
                break;
            }

            navigateDay.setDate(navigateDay.getDate() + 1);
        }

        const duration = draggedTask.deadline ? config.deadlineDurationReplacer : draggedTask.duration;

        ////////////////////////////////////////////////////////
        // PUSH
        positionnedTasksContainers.push({
            taskObject: draggedTask,
            start: new Date(draggedTask.date),
            end: new Date(),
            left: dayIndex * dayWidth,
            top: (taskStartMinutes / dayDurationMinutes - delta) * 100,
            width: dayWidth,
            height: (duration / dayDurationMinutes) * 100
        })
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////:::
    // PART 7 : Sort by id, pour que react ne ser perde pas
    positionnedTasksContainers.sort((a, b) => a.taskObject[config.idKey] > b.taskObject[config.idKey] ? 1 : -1)

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // PART 8 : Render task containers

    const TasksContainersJSXElements: JSX.Element[] = positionnedTasksContainers.map((taskContainer) => (
        <CSSTransition
            key={`${taskContainer.taskObject[config.idKey]}${taskContainer.taskObject.ghost ? ' ghost' : ""}`}
            timeout={200}
            classNames="taskContainerTransition"
        >
            <TaskContainer<TaskType, IdKey>


                task={taskContainer.taskObject}

                left={taskContainer.left}
                top={taskContainer.top}
                width={taskContainer.width}
                height={taskContainer.height}

                // This task represent the previous state of the currently dragged task
                ghost={taskContainer.taskObject.ghost}

                // This taks is currently being dragged
                dragged={taskContainer.taskObject[config.idKey] === store.editing}

                lastEdited={taskContainer.taskObject[config.idKey] === store.lastEdited}

                config={config}
                dispatch={dispatch}
            >
                <RenderWeekTask
                    task={taskContainer.taskObject}
                    config={config}
                    rect={{left: taskContainer.left, top: taskContainer.top, width: taskContainer.width, height: taskContainer.height}}
                />
            </TaskContainer>
        </CSSTransition>
    ));

    /////////////////////////////////////////////////////////////////////////////////////////////////////::
    // PART 9 : Render Editor

    let EditorComponent: JSX.Element | undefined;

    if(store.editor !== "close" && store.editing && RenderEditor) {
        // Find the currently dragged task that is not a ghost
        const positionnedTaskContainer = positionnedTasksContainers.find(
            ptc =>
                ptc.taskObject[config.idKey] === store.editing
                && !ptc.taskObject.ghost
        );

        if(positionnedTaskContainer) {
            EditorComponent = (
                <CSSTransition
                        key="Editor"
                        timeout={500}
                    >
                    <Editor
                        taskContainer={positionnedTaskContainer}
                        config={config}
                    >
                        <RenderEditor
                            task={positionnedTaskContainer.taskObject}
                            config={config}
                            rect={{
                                left: positionnedTaskContainer.left,
                                top: positionnedTaskContainer.top,
                                width: positionnedTaskContainer.width,
                                height: positionnedTaskContainer.height
                            }}
                            post={onPost}
                            patch={onPatch}
                            delete={onDelete}
                            close={() => dispatch("close_editor", {})}
                            clone={() => dispatch("mousedown_clone", {task: positionnedTaskContainer.taskObject})}
                        />
                    </Editor>
                </CSSTransition>
            )
        }
    }

    return [TasksContainersJSXElements, EditorComponent];
}








////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////



// Check if region A and B are overlaping
function overlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return (
      // start of A is in B
      (startB <= startA && startA < endB) ||
      // end of A is in B
      (startB < endA && endA <= endB) ||
      // start of B is in A
      (startA <= startB && startB < endA) ||
      // end of B is in A
      (startA < endB && endB <= endA)
    );
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

// TYPES

/////////////////////////////////////////////////////////////////////////////////////////////////////:
// OVERLAPING REGION

type OverlapingRegion<TaskType extends BaseTaskType> = {
    start: Date;
    end: Date;
    tasksContainers: TaskContainer<TaskType>[];
}

/////////////////////////////////////////////////////////////////////////////////////////////////////:
// TASK CONTAINERS

/**
 * Permet de conserver des informations de calcul redondante pour chaque tâche
 * Avec les informations graphiques
 */
export type PositionnedTaskContainer<TaskType extends BaseTaskType> = {
    start: Date; // Début de la tâche
    end: Date; // Fin de la tâche
    top: number; // La position top absolute dans la grille en %. [0 ; 100[
    left: number; // La position left absolute dans la grille en %. [0 ; 100[
    width: number; // La largeur dans la grille en %. [0 ; 100[
    height: number; // La hauteur dans la grille en %. [0 ; 100[
    taskObject: TaskType & {ghost?: boolean}; // L'objet Task. [0 ; 100[
}

/**
 * Permet de conserver des informations de calcul redondante pour chaque tâche
 */
 type TaskContainer<TaskType extends BaseTaskType> = {
    start: Date; // Début de la tâche
    end: Date; // Fin de la tâche
    taskObject: TaskType & {ghost?: boolean}; // L'objet Task. [0 ; 100[
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// DAYS

/**
 * Day permet d'optimiser d'optimiser les calculs en conservant les données redondantes
 * Il contient toutes les informations de positionnement des conteneurs de tâche
 */
 type Day<TaskType extends BaseTaskType> = {
    dayIndex: number; // Index du jour dans le position de la grille. [0 ; n]
    offset: number; // La position left dans la grille en %. [0 ; 100[
    start: Date; // Le début du jour
    end: Date; // La fin du jour

    tasksContainers: TaskContainer<TaskType>[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////