import React from "react";

import './Main.scss'

export const Main: React.FC<{}> = (props) => {
	return <main className={`Main`}>{props.children}</main>;
};
