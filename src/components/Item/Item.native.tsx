
import React from "react";

export const Item: React.FC<{
	style?: any;
	valid?: boolean;
	disabled?: boolean;
	error?: boolean;
	active?: boolean;
	onClick?: (e: React.MouseEvent<any>) => void;
	onMouseDown?: (e: React.MouseEvent<any>) => void;
}> = (props): JSX.Element => {
	return (
		<li
			style={props.style}
			className={`Item ${props.valid ? "valid" : props.error ? "error" : props.disabled ? "disabled" : ""}${
				props.active ? " active" : ""
			}`}
			onClick={(event) => (props.onClick ? props.onClick(event) : false)}
			onMouseDown={(event) => (props.onMouseDown ? props.onMouseDown(event) : false)}
		>
			{props.children}
		</li>
	);
};
