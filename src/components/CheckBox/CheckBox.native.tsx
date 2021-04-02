import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { TransitionGroup, CSSTransition } from "react-transition-group";

export const CheckBox: React.FC<{
	className?: string;
	onChange?: (checked: boolean) => void;
	label: string;
	name: string;
	defaultValue?: boolean;
	value?: boolean;
	style?: any;
	wrap?: boolean;
	id?: any;
}> = (props): JSX.Element => {
	const [checked, setChecked] = useState(
		typeof props.value === "boolean"
			? props.value
			: typeof props.defaultValue === "boolean"
			? props.defaultValue
			: false
	);

	useEffect(() => {
		if (typeof props.value === "boolean") {
			setChecked(props.value);
		}
	}, [props.value]);

	function handleChange(event: React.MouseEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) {
		if (event) {
			event.stopPropagation();
		}

		const c = !checked;

		if (props.onChange) {
			props.onChange(c);
		}

		setChecked(c);
	}

	return (
		<div
			className={`CheckBox${props.className ? ` ${props.className}` : ""}${checked ? " checked" : ""}${
				props.wrap ? " wrap" : ""
			}`}
			style={props.style}
			onClick={handleChange}
		>
			<input
				id={`CheckBox ${props.label}`}
				type="checkbox"
				onChange={handleChange}
				checked={checked}
				name={props.name}
			/>
			<div className="square">
				<TransitionGroup>
					{checked && (
						<CSSTransition key={props.name} timeout={100}>
							<FontAwesomeIcon icon={faCheck} />
						</CSSTransition>
					)}
				</TransitionGroup>
			</div>
			{props.label && <label htmlFor={`CheckBox ${props.label}`}>{props.label}</label>}
		</div>
	);
};
