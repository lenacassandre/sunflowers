import React from 'react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faGripVertical } from "@fortawesome/free-solid-svg-icons";

export default function Actions<RowType>(props:{
    actions?: {[actionName: string]: (row: RowType) => void};
    grab?: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
}) {
    return (
        <div className="Actions">

            <FontAwesomeIcon
                icon={props.grab ? faGripVertical : faEllipsisV}
                style={{
                    cursor: props.grab ? "grab" : "pointer"
                }}
            />

        </div>
    )
}