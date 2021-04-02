import React from "react";
import "./MiniDay.scss";

import formatNumber from "../../../utils/formatNumber";

import Day from '../../../classes/Day.class'

function shortDate(date: Date) {
  return (
    formatNumber(date.getDate()) +
    "/" +
    formatNumber(date.getMonth() + 1) +
    "/" +
    date.getFullYear()
  );
}

export const MiniDay = (props: {
	day: Day,
	setDate: (date: Date) => void,
	date: Date,
	monthNavDate: Date,
	start: Date,
	end: Date,
	mode: 1 | 5 | 7,
	activeWeek: boolean,
	gotTask: boolean | ((date: Date) => boolean),
}) => {
	const todayDate = new Date();
	const today =
		props.day.date.getDate() === todayDate.getDate() &&
		props.day.date.getMonth() === todayDate.getMonth() &&
		props.day.date.getFullYear() === todayDate.getFullYear();

	const outMonth = props.day.date.getMonth() !== props.monthNavDate.getMonth();

	const outCalendar =
		(props.start && props.start.getTime() > props.day.date.getTime()) ||
		(props.end && props.day.date.getTime() > props.end.getTime());

	const navDate = new Date(props.day.date);
	let delta = 0;
	while (navDate.toString().split(" ")[0] !== "Mon") {
		navDate.setDate(navDate.getDate() - 1);
		delta += 1;
	}
	const highlight =
		outMonth && props.activeWeek && delta < props.mode && (props.mode === 5 || props.mode === 7);

	const dayGotTask = typeof props.gotTask === "function" ? props.gotTask(props.day.date) : false;

	const active =
		props.date &&
		props.day.date.getDate() === props.date.getDate() &&
		props.day.date.getMonth() === props.date.getMonth() &&
		props.day.date.getFullYear() === props.date.getFullYear();

	return (
		<span
		className={`MiniDay${today ? " today" : ""}${
			dayGotTask ? " gotTask" : ""
		}${outMonth ? " outMonth" : ""}${highlight ? " highlight" : ""}${
			outCalendar ? " outCalendar" : ""
		}${active ? " active" : ""}`}
		onClick={(event) =>
			!outCalendar ? props.setDate(props.day.date) : event.stopPropagation()
		}
		>
			<div className="dayBackground"></div>
			<span className="dayNumber">{props.day.day}</span>
		</span>
	);
}
