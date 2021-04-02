import React from "react";
import { MiniDay } from "../MiniDay/MiniDay";
import "./MiniWeek.scss";

import Week from '../../../classes/Week.class'

export const MiniWeek = (props: {
  week: Week,
  date: Date,
  monthNavDate: Date,
  mode: 1 | 5 | 7,
  start: Date,
  end: Date,
  setDate: (date: Date) => void,
  gotTask: boolean | ((date: Date) => boolean),
}) => {
  	const activeWeek = props.week.includes(props.date);

	// Génération des MiniDays de la miniWeek
	const miniDays = props.week.days.map((day, index) => {
		return (
			<MiniDay
				key={index}
				day={day}
				date={props.date}
				setDate={props.setDate}
				mode={props.mode}
				activeWeek={activeWeek}
				start={props.start}
				end={props.end}
				monthNavDate={props.monthNavDate}
				gotTask={props.gotTask}
			/>
		);
	});

  	return <div className="MiniWeek">{miniDays}</div>;
}
