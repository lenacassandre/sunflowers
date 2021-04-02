import React from "react";

import { Input, InputProps } from "../Input/Input";

type NumberProps = InputProps & {
	min?: number;
	max?: number;
};

export const Number: React.FC<NumberProps> = (props): JSX.Element => {
	const { min, max } = props;

	function handleMouseDown() {}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		let value: string | number = event.target.value;

		// Supprime les caractère non numériques
		value = value.replace(/[^0-9]/g, "");

		// String => Number
		value = parseInt(value, 10);

		// Limite max
		if (max && value > max) {
			value = max;
		}

		// Limite min
		if (min && value < min) {
			value = min;
		}

		// Sécurité
		if (typeof value !== "number" || isNaN(value)) {
			value = min ? min : 0;
		}

		// Number => String
		event.target.value = String(value);

		if (props.onChange) {
			// Callback
			props.onChange(event);
		}
	}

	return <Input {...props} className="Number" type="text" onChange={handleChange} onMouseDown={handleMouseDown} />;
};
