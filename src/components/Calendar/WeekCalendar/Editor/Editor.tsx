import React from "react"
import {BaseTaskType, CalendarConfig} from '../../Calendar'
import {PositionnedTaskContainer} from '../useWeekTasks'
import "./Editor.scss"

export function Editor<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    taskContainer: PositionnedTaskContainer<TaskType>,
    config: CalendarConfig<TaskType, IdKey>
    style?: any,
    children: React.ReactChild
}) {
    // CONSTANTS
    const width = 400;
    const margin = 16;

    const style: any = { ...props.style, width: `${width}px` };
	const arrowStyle: any = {};
    const side: "left" | "right" = props.taskContainer.left + (props.taskContainer.width / 2) < 50 ? "right" : "left"

	if (props.taskContainer) {
		// Calcul de la position Y de l'éditeur
		style.top = `${props.taskContainer.top + props.taskContainer.height / 2}%`;
		style.transform = `translateY(-${props.taskContainer.top + props.taskContainer.height / 2}%)`;

		// Calcul de la position Y de la flèche de l'éditeur
		arrowStyle.top = `calc(${
			(props.taskContainer.top + props.taskContainer.height / 2) / 100
		} * (100% - ${margin * 2}px) + ${margin / 3}px)`;

        // Affichage de l'éditeur à droite de la task
        if (side === "right") {
            // Position X de l'éditeur
            style.left = `calc(${
                props.taskContainer.left + props.taskContainer.width
            }% + ${margin * 0.66}px)`;
            // Origine de l'animation de l'éditeur
            style.transformOrigin = "left " + arrowStyle.top;
            // Position X de la flèche de l'éditeur
            arrowStyle.left = `-${margin * 0.66}px`;
        } else {
            // Position X de l'éditeur
            style.left = `calc(${props.taskContainer.left}% - (${style.width} + ${margin * 0.5}px)`;
            // Origine de l'animation de l'éditeur
            style.transformOrigin = "right " + arrowStyle.top;
            // Position X de la flèche de l'éditeur
            arrowStyle.left = `${width - margin}px`;
        }
	}

    return (
        <div
            className={`EditorPosition ${side}`}
            style={style}
        >
            <div className="EditorTransition">
                <div className="editorArrow" style={arrowStyle} />
                <div className="editorContent">
                    {props.children}
                </div>
            </div>
        </div>
    )
}
