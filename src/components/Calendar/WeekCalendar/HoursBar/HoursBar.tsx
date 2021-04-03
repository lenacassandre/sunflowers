import React from "react";
import { BaseTaskType, CalendarConfig } from "../../Calendar";
import "./HoursBar.scss";

///////////////////////////////////////////////////////////////////////////////////////////////
const arePropsEqual = (prevProps: any, nextProps: any) =>
    prevProps.config.startHour === nextProps.config.startHour &&
    prevProps.config.endHour === nextProps.config.endHour;

///////////////////////////////////////////////////////////////////////////////////////////////////////:
export const HoursBar = <TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    config: CalendarConfig<TaskType, IdKey>
}) => {
    const hours: number[] = []

    for(let hour = props.config.startHour; hour < props.config.endHour; hour ++) {
        hours.push(hour);
    }
    console.log("HOURS", hours, props.config)

    return (
        <div className="HoursBar" draggable={false}>
            {
                hours.map((hour, i) => (
                    <div className={`Hour calendarBorder ${i < hours.length ? "border" : ""}`} key={hour} draggable={false}>
                        <span draggable={false}>{String(hour).padStart(2, "0")}:00</span>
                    </div>
                ))
            }
        </div>
    );
}

export default React.memo(HoursBar, arePropsEqual) as typeof HoursBar;
