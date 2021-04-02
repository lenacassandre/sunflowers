import React, { useState } from "react";


import { Button } from "../Button/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import './Modal.scss'

export const Modal: React.FC<{
	title?: string;
	message?: string | JSX.Element;
	resolveButton?: string;
	rejectButton?: string;
	className?: string;
	form?: ((resolve: (data: any) => void, reject: () => void) => JSX.Element) | JSX.Element;
	resolving?: boolean;
	raw?: boolean;
	resolve?: (data: any) => void;
	reject?: (data?: any) => void;
}> = (props) => {
	const formRef: React.RefObject<any> = React.createRef();

	const [error, setError] = useState("");

	// get the values of all inputs
	function send(callback?: (event: React.MouseEvent) => void) {
		const inputs = formRef.current.getElementsByTagName("input");
		const inputsArray = [...inputs].concat([...formRef.current.getElementsByTagName("textarea")]);

		if (inputsArray.some((input) => input.required && !input.value)) {
			setError("Veuillez remplir tous les champs requis pour continuer.");
		} else {
			const values: any = {};

			inputsArray.forEach((input) => {
				if(input.type === "checkbox" || input.type === "radio") {
					values[input.name] = input.value === "on" ? true : false;
				} else {
					values[input.name] =
						input.value.charAt(0) === "[" && input.value.charAt(input.value.length - 1) === "]"
							? JSON.parse(input.value)
							: input.value === "true"
							? true
							: input.value === "false"
							? false
							: input.value;
				}
			});

			if (callback) {
				return callback(values);
			}
		}
	}

	// RENDER //////////////////////////////////////////////////////////////////////////////////////////////////////
	return (
		<div className={`Modal ${props.resolving ? "resolving" : ""} ${props.className || ""}`}>
			<div className="background" onClick={props.reject}></div>
			{
				props.raw && props.form ? (
					<form ref={formRef}>
						{typeof props.form === "function" ? (
							props.form(props.resolve || (() => undefined), props.reject || (() => undefined))
						) : (
							React.cloneElement(props.form, { ...props.form.props, resolve: props.resolve, reject: props.reject })
						)}
					</form>
				)
				: (
				<div className={`modalContent`}>
					<FontAwesomeIcon icon={faTimes} className="quitIcon" onClick={props.reject} />

					{props.title && <h2>{props.title}</h2>}

					{props.message && <p className="message">{props.message}</p>}

					{error && <p className="modalError">{error}</p>}

					{props.form && (
						<form ref={formRef}>
							{typeof props.form === "function" ? (
								props.form(props.resolve || (() => undefined), props.reject || (() => undefined))
							) : (
								React.cloneElement(props.form, { ...props.form.props, resolve: props.resolve, reject: props.reject })
							)}
						</form>
					)}

					{(props.rejectButton || props.resolveButton || !props.form) && (
						<div className="row buttonsRow">
							{props.rejectButton && (
								<Button
									className="rejectButton"
									name={props.rejectButton ? props.rejectButton : "Ok"}
									onClick={props.reject}
								/>
							)}

							{(props.resolveButton || !props.form) && (
								<Button
									className="resolveButton"
									name={props.resolveButton ? props.resolveButton : "Ok"}
									onClick={(event) =>
										props.form ? send(props.resolve) : props.resolve ? props.resolve(event) : false
									}
									filled
								/>
							)}
						</div>
					)}
				</div>
				)
			}
		</div>
	);
};
