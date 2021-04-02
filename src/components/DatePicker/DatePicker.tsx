import React, { useState, useEffect } from "react";

import { MiniCalendar, Button, RequiredSymbol, Input } from "..";


import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

import { dateCH, dateBH } from "../../handlers";

import formatNumber from "../../utils/formatNumber";
import { CallModal } from "../../types";
import "./DatePicker.scss";

export const DatePicker: React.FC<{
	value?: Date,
	modal: CallModal,
	onChange?: (date: Date) => void,
	label: string,
	name: string,
	required?: boolean,
	start: Date,
	end: Date,
	input?: boolean,
	bottom?: boolean,
	top?: boolean,
	middle?: boolean,
}> = (props): JSX.Element => {
	const [date, setDate] = useState<Date>(
		props.value && isValidDate(props.value) ? props.value : props.end ? props.end : new Date()
	);

	function handleChange(newDate: Date) {
		if (props.onChange) {
			props.onChange(new Date(newDate));
		}

		setDate(new Date(newDate));
	}

	const dateString = date.toLocaleDateString("fr", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	useEffect(() => {
		if (props.value && isValidDate(props.value)) setDate(props.value);
	}, [props.value]);

	return (
		<div className="DatePicker">
			{props.label && (
				<label htmlFor={props.name}>
					{props.label}
					{props.required ? <RequiredSymbol /> : ""}
				</label>
			)}

			<Button
				icon={faCalendarAlt}
				name={
					date && date.toLocaleDateString
						? date.toLocaleDateString("fr")
						: "Sélectionner une date"
				}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					props.modal<{date: Date}>({
						title: props.label,
						form: (resolve, reject) => (
							<DatePickerForm
								date={date}
								start={props.start}
								end={props.end}
								dateString={dateString}
								input={props.input}
								bottom={props.bottom}
								top={props.top}
								middle={props.middle}
								resolve={resolve}
								reject={reject}
							/>
						),
						className: "datePickerModal",
					})
						.then((values) => handleChange(values.date))
						.catch(() => {})
				}}
			/>

			<input
				type="hidden"
				value={date ? date.toString() : ""}
				name={props.name}
				required={props.required}
			/>
    	</div>
 	);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

function dateStringToDate(d: string) {
    const [day, month, year] = d.split("/");
    return new Date(`${year}-${formatNumber(month)}-${formatNumber(day)}`);
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

const DatePickerForm: React.FC<{
	date: Date,
	start: Date,
	end: Date,
	dateString: string,
	input?: boolean,
	bottom?: boolean,
	top?: boolean,
	middle?: boolean,
	reject: () => void,
	resolve: (value: {date: Date}) => void,
}> = (props): JSX.Element => {
	const [dateInput, setDateInput] = useState(props.dateString);
	const [dateCalendar, setDateCalendar] = useState(
		isValidDate(new Date(props.date))
			? new Date(props.date)
			: props.end
			? new Date(props.end)
			: new Date()
	);

	function handleInputChange(v: string) {
		if (isValidDate(dateStringToDate(v))) {
			let newDate = dateStringToDate(v);

			newDate =
			props.start && newDate < props.start
					? new Date(props.start)
					: props.end && newDate > props.end
					? new Date(props.end)
					: newDate;

			setDateInput(
				newDate.toLocaleDateString("fr", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				})
			);

			setDateCalendar(newDate);
		} else {
			setDateInput(v);
		}
	}

	function handleCalendarChange(v: Date) {
		setDateCalendar(v);
		setDateInput(
			v.toLocaleDateString("fr", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
		);
	}

	// Au changement de date du parent, on change le state
	useEffect(() => {
		setDateInput(
			props.date.toLocaleDateString("fr", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
		);
		setDateCalendar(dateStringToDate(dateInput));
	}, [props.date]);

	console.log("DATE PICKER FORM", dateInput, dateCalendar)

	return (
		<React.Fragment>
			{props.input && (
				<Input
					name="input"
					changeHandler={dateCH}
					blurHandler={dateBH}
					value={dateInput}
					onChange={(event) => handleInputChange(event.target.value)}
				/>
			)}
			<MiniCalendar
				value={dateCalendar}
				name="date"
				start={props.start}
				mode={7}
				end={props.end}
				onChange={handleCalendarChange}
				bottom={props.bottom}
				top={props.top}
				middle={props.middle}
			/>
			<div className="buttonsRow row">
				<Button
					className="rejectButton"
					name="Annuler"
					onClick={() => props.reject()}
				/>
				<Button
					className="resolveButton"
					name="Valider"
					onClick={() => props.resolve({date: dateCalendar})}
				/>
			</div>
		</React.Fragment>
	);
}
