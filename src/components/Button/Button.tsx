import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './Button.scss'

export const Button: React.FC<{
	active?: boolean;
	filled?: boolean;
	outlined?: boolean;
	className?: string;
	name?: string;
	onClick?: (event: React.MouseEvent) => void;
	onMouseDown?: (event: React.MouseEvent) => void;
	style?: any;
	disabled?: boolean;
	icon?: IconProp;
	type?: "button" | "submit" | "reset" | undefined;
	reference?: any
}> = (props) => {
	return (
		<button
			className={`Button ${props.active ? "active" : ""} ${props.filled ? "filled" : "outlined"} ${
				props.className ? " " + props.className : ""
			}${props.disabled ? " disabled" : ""}${!props.children && !props.name && props.icon ? " onlyIcon" : ""}`}
			name={props.name}
			id={props.name}
			value={props.name}
			onClick={(event) => {
				props.disabled && event.stopPropagation();
				props.onClick && props.onClick(event);
			}}
			onMouseDown={(event) => {
				props.disabled && event.stopPropagation();
				props.onMouseDown && props.onMouseDown(event);
			}}
			style={props.style}
			type={props.type ? props.type : "button"}
			ref={props.reference}
		>
			{props.icon && <FontAwesomeIcon icon={props.icon} />}
			{props.children ? props.children : props.name}
		</button>
	);
};
