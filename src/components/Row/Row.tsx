import React from 'react';
import { StyleHTMLAttributes } from 'react';
import './Row.scss'

export const Row: React.FC<{
    className?: string;
    flex?: boolean;
    style?: any
}> = (props) => {
    return (
        <div className={`Row ${props.className || ""} ${props.flex ? "autoflex" : ""}`} style={props.style}>
            {props.children}
        </div>
    )
}