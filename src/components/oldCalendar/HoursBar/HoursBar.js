import React from 'react';
import forDateToDate from '../../../functions/forDateToDate';
import './HoursBar.scss';

export default function HoursBar({ startingHour, endingHour }) {
    const hours = [];

    forDateToDate(startingHour, endingHour, 60, false, (date, key, hour) => {
        hours.push(
            <div key={key}>
                <span>{hour}</span>
            </div>
        );
    });

    return <div className="HoursBar">{hours}</div>;
}
