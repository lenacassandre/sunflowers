import React from 'react';
import "./TabsPages.scss"

export const TabsPages: React.FC<{
    active: number
    children: JSX.Element[]
}> = (props) => {
    console.log("render tabspages")
    return (
        <div className="TabsPages">
            <div
                className="slideWrapper"
                style={{
                    width: `${props.children.length * 100}%`,
                    left: `${-(props.active || 0) * 100}%`
                }}
            >
                {props.children.map((child, i) => (
                    <div className="TabPage" key={i}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}