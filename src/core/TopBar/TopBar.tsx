import React from "react";

import { BurgerButton } from "../../components/BurgerButton/BurgerButton";
import './TopBar.scss'

export const TopBar: React.FC<{
	className?: string;
	leftBarState?: boolean;
	rightBarState?: boolean;
	toggleLeftBar?: Function;
	toggleRightBar?: Function;
}> = (props) => {
	return (
		<header className={`TopBar ${props.className ? props.className : ""}`}>
			<BurgerButton
				active={props.leftBarState}
				onClick={() => {
					props.toggleLeftBar && props.toggleLeftBar(!props.leftBarState);
				}}
			/>
			<div className="childrenContainer">{props.children}</div>
		</header>
	);
};
