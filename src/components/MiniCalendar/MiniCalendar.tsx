import React, { useState, useEffect } from "react";
import "./MiniCalendar.scss";

import Week from "../../classes/Week.class";

import { MiniWeek } from "./MiniWeek/MiniWeek";
import { MonthNav } from "./MonthNav/MonthNav";
import { MiniDaysBar } from "./MiniDaysBar/MiniDaysBar";

export const MiniCalendar = (props: {
  value?: Date,
  onChange?: (date: Date) => void,
  start: Date,
  end: Date,
  mode: 1 | 5 | 7,
  name: string,
  gotTask?: boolean | ((date: Date) => boolean),
  top?: boolean,
  bottom?: boolean,
  middle?: boolean,
}) => {
	const [date, setDate] = useState<Date>(
		props.value && props.value instanceof Date ? props.value : props.start ? bottomDate(props.start) : new Date()
	);

	const [monthNavDate, setMonthNavDate] = useState(date);
	const [weeks, setWeeks] = useState<Week[]>([]);

	const start = bottomDate(props.start);
	const end = topDate(props.end);

	////////////////////////////////////////////////////////////////////////////////////////////
	// LIFE CYCLE //////////////////////////////////////////////////////////////////////////////
  	useEffect(() => {
		let navDate = new Date(monthNavDate);

		if (props.bottom) {
			navDate = new Date(bottomDate(navDate));
		}

		if (props.middle) {
			navDate = new Date(middleDate(navDate));
		}

		if (top) {
			navDate = new Date(topDate(navDate));
		}

    	const month = navDate.getMonth();

		// Trouve le lundi de la première semaine du mois de la date actuelle
		navDate.setDate(1);

		let n = 0; // pour éviter une boucle infinie

		while (
			navDate.toLocaleDateString("fr", {
				weekday: "long",
			}) !== "lundi" && n < 100
		) {
			navDate.setDate(navDate.getDate() - 1);
			n++;
		}

		// Une date de navigation avec un jour d'avance pour check si le jour suivant est du mois prochain
		const navDateNext = new Date(navDate);
		navDateNext.setDate(navDateNext.getDate() + 1);

    	const newWeeks: Week[] = [];

		n = 0;

		// Va jusqu'au dernier jour de la dernière semaine du mois de la date actuelle
		while ((navDate.getDate() > 20 || navDate.getMonth() === month) && n < 100) {
			newWeeks.push(new Week(navDate));
			navDate.setDate(navDate.getDate() + 7);
			n++;
		}

    	setWeeks(newWeeks);
 	}, [monthNavDate]);

	/////////////////////////////////////////////////////////////////////////////
	// Update the state when the date prop change
	useEffect(() => {
		if (props.value instanceof Date) {
			setDate(props.value);
		}
	}, [props.value]);

	/////////////////////////////////////////////////////////
	// Change the displayed month when the value change
	useEffect(() => {
		if (date instanceof Date) {
			setMonthNavDate(date);
		}
	}, [date]);

  ////////////////////////////////////////////////////////////////////////////////////////////
  // CHANGING DATE //////////////////////////////////////////////////////////////////////////////////

	function handleChange(date: Date) {
		if(props.bottom) {
			date = bottomDate(date)
		}

		if(props.top) {
			date = topDate(date)
		}

		if (props.onChange) {
			props.onChange(date);
		}

		setDate(date);
		setMonthNavDate(date);
	}

  	////////////////////////////////////////////////////////////////////////////////////////////
	// RENDER //////////////////////////////////////////////////////////////////////////////////


	if (weeks && weeks[0]) {
		let activeWeekIndex = 0;
		let activeDayIndex = 0;

		const weeksElements = weeks.map((week, weekIndex) => {
			if (props.mode && week.includes(date)) {
				activeWeekIndex = weekIndex;

				week.days.forEach((day, dayIndex) => {
					if (day.date.getDate() === date.getDate()) {
						activeDayIndex = dayIndex;
					}
				});
			}

			return (
				<MiniWeek
					key={weekIndex}
					mode={props.mode}
					week={week}
					date={date}
					setDate={handleChange}
					start={start}
					end={end}
					monthNavDate={monthNavDate}
					gotTask={props.gotTask || false}
				/>
			);
		});

		let backgroundtyle;

		if (props.mode) {
			backgroundtyle = {
				width: `${(props.mode / 7) * 100}%`,
				top: `${activeWeekIndex * 2}rem`,
				left: props.mode === 1 ? `${(activeDayIndex / 7) * 100}%` : "0%",
			};
		}

		return (
			<div className={`MiniCalendar`}>
				{backgroundtyle && weeks.some((w) => w.includes(date)) && (
					<div
						className="miniCalendarDynamicBackground"
						style={backgroundtyle}
					></div>
				)}

				<MonthNav
					monthNavDate={monthNavDate}
					setMonthNavDate={setMonthNavDate}
					start={start}
					end={end}
				/>
				<MiniDaysBar week={weeks[0]} />
				{weeksElements}
				<input type="hidden" name={props.name} value={date.toString()} />
			</div>
		);
	}
	else {
		return <span>Erreur. Veuillez contacter un·e administrateur·trice.</span>;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function topDate(date: Date): Date {
    const newDate = new Date(date);

    newDate.setHours(23);
    newDate.setMinutes(59);
    newDate.setSeconds(59);
    newDate.setMilliseconds(999);

    return newDate;
}

function middleDate(date: Date): Date {
    const newDate = new Date(date);

    newDate.setHours(12);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
}

function bottomDate(date: Date): Date {
    const newDate = new Date(date);

    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
}
