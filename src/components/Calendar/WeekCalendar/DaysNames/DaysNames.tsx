import React, { useEffect, useState } from 'react';
import './DaysNames.scss';

import { BaseTaskType, CalendarConfig } from '../../Calendar'
import { StoreType } from '../script/store';

///////////////////////////////////////////////////////////////////////////////////////////////////////
const arePropsEqual = (prev: any, next: any) =>
    prev.store.firstDayOfTheWeek && next.store.firstDayOfTheWeek &&
    prev.store.firstDayOfTheWeek.getTime() === next.store.firstDayOfTheWeek.getTime() &&
    prev.config.days === next.config.days

//////////////////////////////////////////////////////////////////////////////////////////////////////:
export const DaysNames = <TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    config: CalendarConfig<TaskType, IdKey>
    store: StoreType<TaskType, IdKey>
}) => {
    const [days, setDays] = useState<Date[]>([])

    useEffect(() => {
        if(props.store.firstDayOfTheWeek) {
            const newDays: Date[] = []

            // Push all days of the week
            for(let dayIndex = 0; dayIndex < props.config.days; dayIndex++) {
                const newDate = new Date(props.store.firstDayOfTheWeek);
                newDate.setDate(newDate.getDate() + dayIndex);
                newDays.push(newDate);
            }

            setDays(newDays)
        }
    }, [props.config.days, props.store.firstDayOfTheWeek])

    console.log("RENDER DAYS NAMES", days)

    return (
        <div className="DaysNames" draggable={false}>
            {
                days.map((day, i) => (
                    <p
                        key={i}
                        className={`DayName`}
                        draggable={false}
                    >
                        {props.config.weekday && <span draggable={false} className="weekday">{day.toLocaleDateString("fr", {weekday: "long"}).substring(0, 3)}.</span>}
                        {props.config.dayNumber && <span draggable={false} className="numday">{day.getDate()}</span>}
                        <span draggable={false} className="borders calendarBorder"></span>
                    </p>
                ))
            }
        </div>
    );
}

export default React.memo(DaysNames, arePropsEqual) as typeof DaysNames;