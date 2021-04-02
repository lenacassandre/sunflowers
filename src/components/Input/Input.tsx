import React, { useEffect, useState, useRef } from "react";

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { RequiredSymbol } from "../RequiredSymbol/RequiredSymbol";

import './Input.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type InputProps = {
	name: string;
	value?: string;
	defaultValue?: string;

	className?: string;
	style?: any;
	label?: string;
	type?: string;
	id?: any;
	inputRef?: React.RefObject<HTMLInputElement>;
	autofocus?: boolean;
	required?: boolean;
	autocomplete?: string;

	icon?: IconProp,

	delay?: number; // delai sur le onChange, afin d'éviter de spammer l'event, surtout s'il fait un appel au serveur à cahque changement

	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onInputChange?: (input: string) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseEnter?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLInputElement>) => void;

	blurHandler?: (value: string) => string
	changeHandler?: (value: string, backward: boolean) => string
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Input: React.FC<InputProps> = (props): JSX.Element => {
	const [value, setValue] = useState<string>(props.value || props.defaultValue || "");
	const ref: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
	const timeout = useRef<number>();

	useEffect(() => {
		if (props.autofocus) {
			if (ref && ref.current) {
				ref.current.focus();
			}

			if (props.inputRef && props.inputRef.current) {
				props.inputRef.current.focus();
			}
		}
	}, []);

	// Bind value
	useEffect(() => {
		if(typeof props.value === "string") {
			setValue(props.value);
		}
	}, [props.value])

	function clearInputTimeout() {
		if(timeout.current) {
			window.clearTimeout(timeout.current);
			timeout.current = 0;
		}
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		let newValue = event.target.value;

		if(props.changeHandler) { // Si un handler de changement est donné, on fait passer la nouvelle valeur dedans
			const backward = newValue.length < value.length;
			newValue = props.changeHandler(event.target.value, backward);
		}

		setValue(newValue);

		const change = () => {
			if(props.onChange) {
				event.target.value = newValue;
				props.onChange(event);
			}
			if(props.onInputChange) {
				props.onInputChange(newValue);
			}
		}

		if (props.onChange || props.onInputChange) {
			if(props.delay) { // Si un délai est programmé pour le onChange
				// On annule l'ancien délai
				clearInputTimeout()

				// On relance un délai, qui appelera onChange dans X ms.
				timeout.current = window.setTimeout(() => {
					change()
				}, props.delay);
			} else {
				change()
			}
		}
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter" && event.target) {
			const target = event.target as HTMLInputElement;
			target.blur();
		}

		if (props.onKeyDown) {
			props.onKeyDown(event);
		}
	}

	function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
		if (props.onFocus) {
			props.onFocus(event);
		}
	}

	function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
		clearInputTimeout()

		if(props.onChange && props.value !== value) {
			props.onChange(event);
		}

		if(props.onInputChange && props.value !== value) {
			props.onInputChange(value);
		}

		if(props.blurHandler) {
			event.target.value = props.blurHandler(event.target.value);
		}

		if (props.onBlur) {
			props.onBlur(event);
		}
	}

	function focus() {
		console.log("focus")
		if(ref && ref.current) {
			console.log(ref)
			ref.current.focus()
		}

		if(props.inputRef && props.inputRef.current) {
			console.log("inputRef")
			props.inputRef.current.focus()
		}
	}

	return (
		<div
			className={`Input${props.className ? " " + props.className : ""}`}
			onClick={
				props.inputRef && props.inputRef.current
					? () => props.inputRef!.current!.focus()
					: ref && ref.current
					? () => ref!.current!.focus()
					: () => false
			}
			style={props.style}
		>
			{props.icon && <FontAwesomeIcon icon={props.icon} />}
			<input
				placeholder=" "
				name={props.name}
				id={props.id ? props.name + props.id : props.name}
				value={value}
				defaultValue={props.defaultValue}
				//className={state ? state : error ? 'error' : valid ? 'valid' : ''}
				title="" //Pour éviter les title par défaut des navigateurs
				autoComplete={props.autocomplete ? props.autocomplete : "off"}
				ref={props.inputRef || ref}
				type={props.type ? props.type : "text"}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
				onBlur={handleBlur}
				required={props.required}
			/>
			<label
				htmlFor={props.id ? props.name + props.id : props.name}
				onMouseDown={focus}
				onClick={focus}
			>
				{props.label}
				{props.required && <RequiredSymbol />}
			</label>

			{/*<p className={!error ? 'hidden' : ''}>{error}</p> */}
		</div>
	);
};

/********************************************************************************************************************* */
