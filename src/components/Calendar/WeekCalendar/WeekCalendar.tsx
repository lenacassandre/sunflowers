import React, { useCallback, useRef, useEffect, useState } from "react";
import "./WeekCalendar.scss";

import DaysNames from './DaysNames/DaysNames'
import DaysBorders from './DaysBorders/DaysBorders'
import HoursBar from "./HoursBar/HoursBar"
import { BaseTaskType, CalendarConfig, OnDelete, OnPatch, OnPatchLazy, OnPost, RenderEditor, RenderTask } from "../Calendar"

import { useWeekTasks } from './useWeekTasks'

import initialStore, { StoreType } from './script/store'
import reducer from './script/reducer'
import { Actions } from './script/actions'
import { CSSTransition, TransitionGroup } from "react-transition-group";

////////////////////////////////////////////////////////////////////////////////////////////////////:
function mouseDatePosition<TaskType extends BaseTaskType, IdKey extends keyof TaskType>( // renvoie le jour sur lequel la souris est
    event: React.MouseEvent<HTMLDivElement> | MouseEvent,
    gridRef: React.RefObject<HTMLDivElement>,
    config: CalendarConfig<TaskType, IdKey>,
    store: StoreType<TaskType, IdKey>
): Date | undefined {
    if(gridRef.current && store.firstDayOfTheWeek) {
        // DAY ////////////////////////////////////////////////////////////////////////////////:
        const gridRect = gridRef.current.getBoundingClientRect()

        let x = event.clientX / gridRect.width - gridRect.left / gridRect.width; // Entre 0 et 1, un nombre qui indique la position X relative dans la grille
        x = x > 0.999 ? 0.999 : x < 0 ? 0 : x; // boundaries

        let dayIndex = Math.floor(x * config.days);

        const newDate = new Date(store.firstDayOfTheWeek);
        newDate.setDate(newDate.getDate() + dayIndex); // Jour sur lequel clic la souris

        // HOUR /////////////////////////////////////////////////////////////////////////////:
        let y = event.clientY / gridRect.height - gridRect.top / gridRect.height; // Entre 0 et 1, un nombre qui indique la position X relative dans la grille
        y = y > 0.999 ? 0.999 : y < 0 ? 0 : y; // boundaries

        let hour = y * (config.endHour - config.startHour) + config.startHour;

        const hours = Math.floor(hour);

        const reverseStep = 60 / config.step;

        const minutes = Math.floor((hour - hours) * reverseStep) * config.step

        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        return newDate;
    }

    return
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function WeekCalendar<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    tasks: TaskType[];
    config: CalendarConfig<TaskType, IdKey>;

    renderWeekTask: RenderTask<TaskType, IdKey>;

    onPost?: OnPost<TaskType, IdKey>;
    onPatch?: OnPatch<TaskType>;
    onDelete?: OnDelete<TaskType>;

    onClick?: (task: TaskType) => void

    lock?: (task: TaskType) => boolean;
    lockResize?: (task: TaskType) => boolean;
    lockMove?: (task: TaskType) => boolean;

    renderEditor?: RenderEditor<TaskType, IdKey>;
}) {
    // Store
    const [store, setStore] = useState<StoreType<TaskType, IdKey>>(initialStore);
    const storeRef = useRef(store);
    storeRef.current = store;

    // Tasks array
    const [tasks, setTasks] = useState<TaskType[]>(props.tasks)
    const tasksRef = useRef(tasks)
    tasksRef.current = tasks;

    // Bind WeekCalendar Tasks to props Tasks
    useEffect(() => setTasks(props.tasks), [props.tasks])

    /////////////////////////////////////////////////////////////////////////////////////////////////:
    // Find first day of the week
    useEffect(() => {
        const weekStart = new Date(props.config.day);

        for(let i = 0; i < 7; i++) {
            if(weekStart.toLocaleDateString("en", {weekday: "long"}).toLowerCase() === props.config.firstDayOfWeek) {
                break;
            }
            weekStart.setDate(weekStart.getDate() - 1)
        }

        setStore({...storeRef.current, firstDayOfTheWeek: weekStart})
    }, [props.config.day, props.config.days, props.config.firstDayOfWeek])

    /////////////////////////////////////////////////////////////////////////////////////////////////:
    // onPatch with or without lazy mode
    // Si le lazy mode est activé, et que le reducer ne demande pas à envoyer le patch, on ne le change que localement
    const onPatch: OnPatchLazy<TaskType> = (task, patch, send) => {

        // Lazy patch : patch d'abord
        if(props.config.lazyPatch && !send) {
            setTasks(
                tasksRef.current.map(t => {

                    if(task[props.config.idKey] === t[props.config.idKey]) {

                        for(const p in patch) {
                            const patchKey = p as keyof typeof patch;
                            t[patchKey] = patch[patchKey];
                        }

                        return t;
                    }
                    else {
                        return t
                    }
                })
            )
        }
        else {
            props.onPatch && props.onPatch(task, patch)
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Dispatch
    const dispatch = <Action extends keyof Actions<TaskType, IdKey>>(
        type: Action,
        action: Actions<TaskType, IdKey>[Action]
    ) => {
        const update = reducer<TaskType, IdKey, Action>(
            storeRef.current,
            type,
            action,
            props.config,
            tasksRef.current,
            dispatch,
            props.onPost,
            onPatch,
            props.onDelete,
            props.onClick,
            props.lock,
            props.lockResize,
            props.lockMove,
        )

        if(update) {
            setStore({...storeRef.current, ...update})
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // TASKS ELEMENTS
    const [Tasks, Editor] = useWeekTasks<TaskType, IdKey>(
        tasksRef.current,
        props.config,
        store,
        dispatch,
        props.renderWeekTask,
        props.renderEditor,
        props.onPost,
        props.onPatch,
        props.onDelete,
        props.lock,
        props.lockResize,
        props.lockMove,
    )

    // Grid ref for calcultations purpose
    const gridRef = useRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;

    /////////////////////////////////////////////////////////////////////////////////////////////////:
    // Mouse events handlers

    const mouseDownGrid = (event: React.MouseEvent<HTMLDivElement>) => {
        const mouseDate = mouseDatePosition(event, gridRef, props.config, storeRef.current);

        //@ts-ignore
        if(mouseDate) dispatch("mousedown_grid", {date: mouseDate, event})
    }

    const mouseMoveWindow = (event: MouseEvent) => {
        const mouseDate = mouseDatePosition(event, gridRef, props.config, storeRef.current);
        if(mouseDate) dispatch("mousemove_grid", {date: mouseDate})
    }

    const mouseUpWindow = (event: MouseEvent) => {
        const mouseDate = mouseDatePosition(event, gridRef, props.config, storeRef.current);
        if(mouseDate) dispatch("mouseup_grid", {date: mouseDate})
    }

    const mouseDownFocusLayer = (event: React.MouseEvent<HTMLDivElement>) => {
        //@ts-ignore
        dispatch("mousedown_filter", {event});
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        window.addEventListener("mousemove", mouseMoveWindow)
        window.addEventListener("mouseup", mouseUpWindow)

        return () => {
            window.removeEventListener("mousemove", mouseMoveWindow)
            window.removeEventListener("mouseup", mouseUpWindow)
        }
    })

    ///////////////////////////////////////////////////////////////////////////////////////////////////:
    return (
        <div className="WeekCalendar" draggable={false}>
            <DaysNames<TaskType, IdKey> config={props.config} store={storeRef.current}/>
            <div className="WeekCalendarMain" draggable={false}>

                <DaysBorders config={props.config} />

                <HoursBar<TaskType, IdKey> config={props.config}/>

                <div
                    className="grid"
                    id="grid"
                    ref={gridRef}
                    onMouseDown={mouseDownGrid}
                >
                    <TransitionGroup className="tasksGroup">
                        {Tasks}
                    </TransitionGroup>

                    {Editor && (
                        <TransitionGroup className="editorGroup">
                            {Editor}
                        </TransitionGroup>
                    )}

                    {
                        // FOCUS LAYER /////////////////////////////////////////////////////////////////////////
                        props.config.focusLayer && (
                            <TransitionGroup className="focusLayerGroup">
                                {
                                    store.editing && (
                                        <CSSTransition
                                            key="focusLayer"
                                            timeout={100}
                                            classNames="focusLayerTransition"
                                            appear
                                        >
                                            <div
                                                className="focusLayer"
                                                id="focusLayer"
                                                onMouseDown={mouseDownFocusLayer}
                                            />
                                        </CSSTransition>
                                    )
                                }
                            </TransitionGroup>
                        )
                    }
                </div>
            </div>
        </div>
    );
};