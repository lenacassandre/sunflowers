import React from "react";
import { BaseTaskType, CalendarConfig, OnDelete, OnPatch, OnPost } from "../Calendar";
import "./MonthCalendar.scss";

export function MonthCalendar<TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    tasks: TaskType[];
    config: CalendarConfig<TaskType, IdKey> ;

    onPost: OnPost<TaskType, IdKey>;
    onPatch: OnPatch<TaskType>;
    onDelete: OnDelete<TaskType>;
}) {
    return (
        <div className="MonthCalendar">Month calendar</div>
    );
}