import React from "react";

export const List: React.FC<{
	style?: any;
	className?: string;
	listRef?: React.RefObject<any>;
}> = (props): JSX.Element => {
	return (
		<ul className={`List${props.className ? ` ${props.className}` : ""}`} style={props.style} ref={props.listRef}>
			{props.children}
		</ul>
	);
};
