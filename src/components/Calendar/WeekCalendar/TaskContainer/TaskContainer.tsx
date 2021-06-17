import { config } from "dotenv/types";
import React, { useCallback } from "react";
import { CSSTransition } from "react-transition-group";
import { BaseTaskType, CalendarConfig } from "../../Calendar";
import { Actions } from "../script/actions";

import "./TaskContainer.scss"

const getPadding = (percent: number, padding: number) => `calc(${percent}% + ${padding}px)`

export function TaskContainer<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    task: TaskType;

    left: number;
    top: number;
    width: number;
    height: number;

    ghost?: boolean; // id the task doesnt exists, but is just a representation of the previous state of the task beign currently dragged
    dragged?: boolean; // the task is currently dragged
    lastEdited?: boolean; // the last task that was edited. Must remain on top of other tasks during the animation

    children: React.ReactChild

    config: CalendarConfig<TaskType, IdKey>;
    dispatch: <Action extends keyof Actions<TaskType, IdKey>>(type: Action, action: Actions<TaskType, IdKey>[Action]) => void

    lock?: (task: TaskType) => boolean;
    lockResize?: (task: TaskType) => boolean;
    lockMove?: (task: TaskType) => boolean;
}) {
    const sizeClass = props.task.duration <= 15
        ? "xs"
        : props.task.duration <= 30
        ? "s"
        : props.task.duration <= 60
        ? "m"
        : props.task.duration <= 90
        ? "l"
        : "xl"

    const mouseDownTop = (event: React.MouseEvent) => {
        // @ts-ignore
        props.dispatch("mousedown_top", {taskId: props.task[props.config.idKey], event});
    }

    const mouseDownMid = (event: React.MouseEvent) => {
        // @ts-ignore
        props.dispatch("mousedown_mid", {taskId: props.task[props.config.idKey], event});
    }
    const mouseDownBot = (event: React.MouseEvent) => {
        // @ts-ignore
        props.dispatch("mousedown_bot", {taskId: props.task[props.config.idKey], event});
    }

    const mouseUp = (event: React.MouseEvent) => {
        event.stopPropagation();
        props.dispatch("mouseup_task", {taskId: props.task[props.config.idKey]})
    }

    const id = `${props.task[props.config.idKey]}${props.ghost ? " ghost" :""}`

    return (

            <div
                draggable={false}
                className={`TaskContainer ${sizeClass} ${props.ghost ? "ghost" : ""} ${props.dragged ? "dragged" : ""} ${props.lastEdited ? "lastEdited" : ""}`}
                style={{
                    left   : props.dragged ? getPadding(props.left, -props.config.highlightPadding) : props.left   + "%",
                    top    : props.dragged ? getPadding(props.top, -props.config.highlightPadding) : props.top    + "%",
                    width  : props.dragged ? getPadding(props.width, props.config.highlightPadding * 2) : props.width  + "%",
                    height : props.dragged ? getPadding(props.height, props.config.highlightPadding * 2) : props.height + "%",
                }}

            >
                {props.children}

                {
                    (!props.lock || !props.lock(props.task)) && (
                        <div className="eventListeners" draggable={false} onMouseUp={mouseUp}>
                            {
                                (
                                    !props.task.deadline
                                    && (!props.lockResize || !props.lockResize(props.task))
                                    && (!props.lockMove || !props.lockMove(props.task))
                                )
                                && <div className="eventListener top" onMouseDown={mouseDownTop} draggable={false} />
                            }
                            <div className="eventListener mid" onMouseDown={mouseDownMid} draggable={false} />
                            {
                                (
                                    !props.task.deadline
                                    && (!props.lockResize || !props.lockResize(props.task))
                                    && (!props.lockMove || !props.lockMove(props.task))
                                )
                                && <div className="eventListener bot" onMouseDown={mouseDownBot} draggable={false} />
                            }
                        </div>
                    )
                }
            </div>
    )
}