import React, { useContext, StyleHTMLAttributes } from "react";

import { Context } from  '../ViewComposer/ViewComposer'

export const Link: React.FC<{
    href: string;
    params?: {[key: string]: string};
    style?: StyleHTMLAttributes<any>;
    className?: string;
}> = (props) => {
    const context = useContext(Context)

	return (
		<a
            className={`Link${props.className ? ` ${props.className}`: ""}`}
            style={props.style}
            href="javascript:;"
            onClick={() => context.router?.navigate(props.href)}
		>
			{props.children}
		</a>
	);
};
