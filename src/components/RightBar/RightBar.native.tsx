import React from "react";

export const RightBar: React.FC<{
	active?: boolean;
}> = (props) => {
	return <aside className={`RightBar${props.active ? " active" : ""}`}>{props.children}</aside>;
};
