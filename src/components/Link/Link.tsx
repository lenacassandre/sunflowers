import React, { StyleHTMLAttributes } from "react";

import { useSunContext } from  '../../core/ViewComposer/ViewComposer'

export const Link: React.FC<{
    href: string;
    params?: {[key: string]: string};
    style?: StyleHTMLAttributes<any>;
    className?: string;
}> = (props) => {
    const sunContext = useSunContext()

	return (
        <a
            className={`Link${props.className ? ` ${props.className}`: ""}`}
            style={props.style}
            href="javascript:;"
            onClick={() => {
                sunContext.router.navigate(props.href)
            }}
        >
            {props.children}
        </a>
	);
};
