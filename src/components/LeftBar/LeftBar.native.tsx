import React from "react";

export const LeftBar: React.FC<{
	active: boolean;
	className?: string;
}> = (props) => {
	return (
		<aside className={`LeftBar${props.active ? " active" : ""} ${props.className ? props.className : ""}`}>
			{props.children}
		</aside>
	);
};
