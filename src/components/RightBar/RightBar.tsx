import React from "react";

import './RightBar.scss'

export const RightBar: React.FC<{
	active?: Boolean;
}> = (props) => {
	return <aside className={`RightBar${props.active ? " active" : ""}`}>{props.children}</aside>;
};
