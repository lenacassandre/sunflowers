import React, { memo } from "react";

import Cell from "../Cell/Cell";
import Actions from "../Actions/Actions";

import { Button } from "../../../Button/Button";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { Column } from "../../types";


export default function Row<RowType = {[key: string]: any}>(props: {
	row: RowType;
	columns: Column<RowType>[];
	index: number;
	//sortedColumns: Column[];
	//style: any;
	//sub?: boolean;
	//withoutMemo?: boolean;
	//remove?: (row: CustomDocumentType) => void;
	//onClick?: (row: any) => void;
	grab?: boolean;
	actions?: { [actionName: string]: (row: RowType) => void };

	valid?: boolean;
	warning?: boolean;
	error?: boolean;
}): JSX.Element {
	// Get the position in rem for each fixed column, depending of their position
	/*function getPositionForFixedColumn(index: number) {
		const columnsBefore = props.fixedColumns.slice(0, index);

		if (columnsBefore.length === 0) {
			return 0;
		} else {
			return columnsBefore
				.map((col: Column) => col.size)
				.reduce((total: number = 0, current?: number) => (current ? total + current : total));
		}
	}*/

	return (
		<tr
			key={props.index}
			style={{}}
			/*className={`${props.sub ? " sub" : ""}${props.onClick ? " clickable" : ""}${
				props.error ? " error" : props.warning ? " warning" : props.valid ? " valid" : ""
			}`}*/
			/*onClick={
				props.onClick ? () => props.onClick && props.onClick(props.row) : () => false
			}*/
		>
			{
				(props.actions || props.grab) && (
					<Actions<RowType> actions={props.actions} grab={props.grab} />
				)
			}
			{props.columns.map((col, index) => {
				/*if (col.key === "remove" && col.type === "feature" && props.remove) {
					return (
						<Cell
							key={colIndex}
							colIndex={colIndex}
							col={col}
							first={props.head.indexOf(col) === 0}
							lastFixed={props.fixedColumns[props.fixedColumns.length - 1] === col}
							order={props.head.indexOf(col)}
							left={getPositionForFixedColumn(props.head.indexOf(col)) + "rem"}
							style={{ justifyContent: "flex-end" }}
							value={
								<Button
									icon={faTrashAlt}
									className="removeRowButton"
									onClick={(event) => {
										event.stopPropagation();

										if (props.remove) {
											props.remove(props.row);
										}
									}}
									filled
								/>
							}
						/>
					);
				} else {*/
					return (
						<Cell<RowType>
							key={index} // React key

							row={props.row}
							column={col}
							index={index}

							//first={props.head.indexOf(col) === 0}
							//order={props.head.indexOf(col)}
							//left={getPositionForFixedColumn(props.head.indexOf(col)) + "rem"}
						/>
					);
				//}
			})}
		</tr>
	);
};


