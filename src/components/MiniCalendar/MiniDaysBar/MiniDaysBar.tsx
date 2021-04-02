import React from 'react';
import './MiniDaysBar.scss';

import Week from "../../../classes/Week.class"

export const MiniDaysBar = (props: { week: Week }) => {
    const weekdays = props.week.days.map((day, index) => (
        <span key={index} className="miniWeekDay">
            {day.weekDay[0]}
        </span>
    ));
    return <div className="MiniDaysBar">{weekdays}</div>;
}
