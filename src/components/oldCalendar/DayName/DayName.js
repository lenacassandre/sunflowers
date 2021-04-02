import React from 'react';
import './DayName.scss';

export default function DayName({ date, day, left, width, out }) {
    return (
        <p
            className={`DayName${day.day === String(date.getDate()) ? ' active' : ''}${
                out ? ' out' : ''
            }`}
            style={{
                width: width + '%',
                left: left + '%',
            }}
            key={day.key}
        >
            <span className="weekday">{day.weekDay.substring(0, 3)}.</span>
            <span className="numday">{day.day}</span>
            <span className="borders"></span>
        </p>
    );
}
