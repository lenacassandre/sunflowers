import React from "react";
import { BaseTaskType, CalendarConfig } from "../../Calendar";
import "./WeekTask.scss";

export function WeekTask<TaskType extends BaseTaskType>(props: {
    tasks: TaskType[];
    config: CalendarConfig;
}) {
    return (
        <div className="WeekTask">Content</div>
    );
}