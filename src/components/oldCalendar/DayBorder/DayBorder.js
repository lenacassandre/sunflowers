import React from 'react';
import './DayBorder.scss';

export default function DayBorder({ left, width, out }) {
    return (
        <div
            className={`DayBorder${out ? ' out' : ''}`}
            style={{ left: left + '%', width: width + '%' }}
        ></div>
    );
}
