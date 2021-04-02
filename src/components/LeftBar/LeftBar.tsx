import React from "react";

import './LeftBar.scss'

export const LeftBar: React.FC<{
	active: Boolean;
	className?: string;
}> = (props) => {
	return (
		<aside className={`LeftBar${props.active ? " active" : ""} ${props.className ? props.className : ""}`}>
			{props.children}
		</aside>
	);
};
