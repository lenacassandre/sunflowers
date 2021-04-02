import React from "react";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import './Notification.scss'

export const Notification: React.FC<{
	id: number;
	close: Function;
	className?: string;
	style?: any;
}> = (props) => {
	return (
		<div className={`Notification${props.className ? ` ${props.className}` : ""}`} style={props.style}>
			<div className="notificationChildrenContainer">{props.children}</div>
			<FontAwesomeIcon
				onClick={function () {
					props.close(props.id);
				}}
				className="closeNotificationIcon"
				icon={faTimes}
			/>
		</div>
	);
};
