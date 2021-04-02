import React, { useState } from "react";

import { Button } from "../Button/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export const Modal: React.FC<{
	title?: string;
	message?: string;
	resolveButton?: string;
	rejectButton?: string;
	className?: string;
	form?: any;
	resolve?: (event: React.MouseEvent) => void;
	reject?: (event: React.MouseEvent) => void;
}> = (props) => {
	const formRef: React.RefObject<any> = React.createRef();

	const Form = props.form;

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
				values[input.name] =
					input.value.charAt(0) === "[" && input.value.charAt(input.value.length - 1) === "]"
						? JSON.parse(input.value)
						: input.value === "true"
						? true
						: input.value === "false"
						? false
						: input.value;
			});

			console.log("values\n", values);

			if (callback) {
				return callback(values);
			}
		}
	}

	return (
		<div className={`Modal${props.className ? " " + props.className : ""}`}>
			<div className="background" onClick={props.reject} />
			<div className="modalContent">
				<FontAwesomeIcon icon={faTimes} className="quitIcon" onClick={props.reject} />

				{props.title && <h2>{props.title}</h2>}

				{props.message && <p className="message">{props.message}</p>}

				{error && <p className="modalError">{error}</p>}

				{Form && (
					<form ref={formRef}>
						{typeof Form === "function" ? (
							<Form resolve={props.resolve} reject={props.reject} />
						) : (
							React.cloneElement(Form, { ...Form.props, resolve: props.resolve, reject: props.reject })
						)}
					</form>
				)}

				{(props.rejectButton || props.resolveButton || !Form) && (
					<div className="row buttonsRow">
						{props.rejectButton && (
							<Button
								className="rejectButton"
								name={props.rejectButton ? props.rejectButton : "Ok"}
								onClick={props.reject}
							/>
						)}

						{(props.resolveButton || !Form) && (
							<Button
								className="resolveButton"
								name={props.resolveButton ? props.resolveButton : "Ok"}
								onClick={(event) =>
									Form ? send(props.resolve) : props.resolve ? props.resolve(event) : false}
								filled
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
