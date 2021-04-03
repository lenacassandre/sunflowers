import React from 'react';
import { BaseTaskType, CalendarConfig } from '../../Calendar';
import './DaysBorders.scss';

//////////////////////////////////////////////////////////////////////////////////////////////////////////
const arePropsEqual = (prev: any, next: any) =>
    prev.config.days === next.config.days

//////////////////////////////////////////////////////////////////////////////////////////////////////
const DaysBorders = <TaskType extends BaseTaskType, IdKey extends keyof TaskType>(props: {
    config: CalendarConfig<TaskType, IdKey>
}) => {
    const days: number[] = []

    for(let i = 0; i < props.config.days; i++) {
        days.push(i);
    }

    return (
        <div className="DaysBorders" draggable={false}>
            {
                days.map(day => (
                    <div key={day} className="DayBorder calendarBorder" draggable={false}/>
                ))
            }
        </div>
    );
}

export default React.memo(DaysBorders, arePropsEqual) as typeof DaysBorders;