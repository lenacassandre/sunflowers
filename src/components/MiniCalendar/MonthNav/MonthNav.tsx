import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { faAngleDoubleLeft } from "@fortawesome/free-solid-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";

import "./MonthNav.scss";

export const MonthNav = (props:{
    setMonthNavDate: (date: Date) => void,
    monthNavDate: Date,
    start: Date,
    end: Date,
}) => {
    return (
        <div className="MonthNav">
			<FontAwesomeIcon
				onClick={() => {
					console.log("MiniCalendar, monthNav <= year");
					const newDate = new Date(props.monthNavDate);
					newDate.setFullYear(newDate.getFullYear() - 1);

					if (!props.start || new Date(props.start) <= newDate) {
						props.setMonthNavDate(newDate);
					} else if (props.start) {
						props.setMonthNavDate(new Date(props.start));
					}
				}}
				className="monthNavIcon"
				icon={faAngleDoubleLeft}
				size="sm"
			/>

			<FontAwesomeIcon
				onClick={() => {
					console.log("MiniCalendar, monthNav <= month");
					const newDate = new Date(props.monthNavDate);

					newDate.setMonth(newDate.getMonth() - 1);

					console.log("new monthNav date", newDate);

					console.log("start", props.start);
					console.log("end", props.end);

					if (!props.start || new Date(props.start) <= newDate) {
						console.log("1");
						props.setMonthNavDate(newDate);
					} else if (props.start) {
						console.log("2");
						props.setMonthNavDate(new Date(props.start));
					}
				}}
				className="monthNavIcon"
				icon={faAngleLeft}
				size="sm"
			/>

			<p>
				{props.monthNavDate.toLocaleDateString("fr", {
					month: "long",
					year: "numeric",
				})}
			</p>

			<FontAwesomeIcon
				onClick={() => {
					console.log("MiniCalendar, monthNav => month");
					const newDate = new Date(props.monthNavDate);
					newDate.setMonth(newDate.getMonth() + 1);
					if (!props.end || newDate <= new Date(props.end)) {
						props.setMonthNavDate(newDate);
					} else if (props.end) {
						props.setMonthNavDate(new Date(props.end));
					}
				}}
				className="monthNavIcon"
				icon={faAngleRight}
				size="sm"
			/>

			<FontAwesomeIcon
				onClick={() => {
					console.log("MiniCalendar, monthNav => year");
					const newDate = new Date(props.monthNavDate);
					newDate.setFullYear(newDate.getFullYear() + 1);
					if (!props.end || newDate <= new Date(props.end)) {
						props.setMonthNavDate(newDate);
					} else if (props.end) {
						props.setMonthNavDate(new Date(props.end));
					}
				}}
				className="monthNavIcon"
				icon={faAngleDoubleRight}
				size="sm"
			/>
        </div>
    );
}
