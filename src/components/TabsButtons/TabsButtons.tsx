import React from 'react';
import { Button } from '..';

import "./TabsButtons.scss";

export const TabsButtons: React.FC<{
    onClick?: (id: number) => void
    sytle?: any;
    className?: string,
    pages: string[]
    active?: number;
}> = (props) => {
    return (
        <div className={`TabsButtons ${props.className || ""}`}>
            {props.pages.map((b, i) => (
                <a
                    key={i}
                    onClick={() => props.onClick && props.onClick(i)}
                    className={props.active === i ? "active" : ""}
                >
                    {b}
                </a>
            ))}
            <div
                className="Line"
                style={{
                    width: `calc(100%/${props.pages.length})`,
                    left: `calc((100%/${props.pages.length}) * ${props.active})`
                }}
            />
        </div>
    )
}