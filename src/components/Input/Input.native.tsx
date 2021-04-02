import React, { useEffect } from "react";

import { RequiredSymbol } from "../RequiredSymbol/RequiredSymbol";

export type InputProps = {
	name: string;
	value: string;

	className?: string;
	style?: any;
	label?: string;
	type?: string;
	id?: any;
	defaultValue?: string;
	inputRef?: React.RefObject<HTMLInputElement>;
	autofocus?: boolean;
	required?: boolean;
	autocomplete?: string;

	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseEnter?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseDown?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseUp?: (event: React.MouseEvent<HTMLInputElement>) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export const Input: React.FC<InputProps> = (props): JSX.Element => {
	const ref: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

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

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (props.onChange) {
			props.onChange(event);
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
		if (props.onBlur) {
			props.onBlur(event);
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
			<input
				placeholder=" "
				name={props.name}
				id={props.id ? props.name + props.id : props.name}
				value={typeof props.value === "string" || typeof props.value === "number" ? props.value : undefined}
				defaultValue={props.defaultValue}
				//className={state ? state : error ? 'error' : valid ? 'valid' : ''}
				title="" //Pour éviter les title par défaut des navigateurs
				autoComplete={props.autocomplete ? props.autocomplete : "off"}
				ref={props.inputRef ? props.inputRef : ref}
				type={props.type ? props.type : "text"}
				onFocus={handleFocus}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
				onBlur={handleBlur}
				required={props.required}
			/>
			<label
				htmlFor={props.id ? props.name + props.id : props.name}
				onMouseDown={props.inputRef ? () => props.inputRef!.current!.focus() : () => ref.current!.focus()}
			>
				{props.label}
				{props.required && <RequiredSymbol />}
			</label>

			{/*<p className={!error ? 'hidden' : ''}>{error}</p> */}
		</div>
	);
};

/********************************************************************************************************************* */
