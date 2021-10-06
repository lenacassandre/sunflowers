import React from "react";

import './Middle.scss'

export const Middle: React.FC<{
	className?: string;
}> = (props) => {
	return <div className={`Middle ${props.className ? props.className : ""}`}>{props.children}</div>;
};
