import React from 'react';
import "./Col.scss"

export const Col: React.FC<{
    style?: any;
    className?: string;

    /////////////////////////////////////////////////
    flex1?: boolean;
    flex2?: boolean;
    flex3?: boolean;
    flex4?: boolean;
    flex5?: boolean;
    flex6?: boolean;

    ///////////////////////////////////////////////:
}> = (props) => {
    return (
        <div
            className={`Col ${props.className || ""}`}
            style={{
                flex: props.flex6 ? 6 : props.flex5 ? 5 : props.flex4 ? 4 : props.flex3 ? 3 : props.flex2 ? 2 : 1,
                ...props.style
            }}
        >
            {props.children}
        </div>
    )
}