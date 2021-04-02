import React, { memo } from "react";

import { Cell } from "../Cell/Cell";

import { Button } from "../../../Button/Button";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { Column } from "../../Table";

type RowProps = {
	head: Column[];
	rowIndex: number;
	row: any;
	fixedColumns: Column[];
	sortedColumns: Column[];
	style: any;
	sub?: boolean;
	withoutMemo?: boolean;
	remove?: (_id: string) => void;
	onClick?: (row: any) => void;
	valid?: boolean;
	warning?: boolean;
	error?: boolean;
};

export const Row: React.FC<RowProps> = (props): JSX.Element => {
	// Get the position in rem for each fixed column, depending of their position
	function getPositionForFixedColumn(index: number) {
		const columnsBefore = props.fixedColumns.slice(0, index);

		if (columnsBefore.length === 0) {
			return 0;
		} else {
			return columnsBefore
				.map((col: Column) => col.size)
				.reduce((total: number = 0, current?: number) => (current ? total + current : total));
		}
	}

	return (
		<tr
			key={props.rowIndex}
			style={props.style}
			className={`${props.sub ? " sub" : ""}${!props.row.disabled && props.onClick ? " clickable" : ""}${
				props.error ? " error" : props.warning ? " warning" : props.valid ? " valid" : ""
			}`}
			onClick={
				!props.row.disabled && props.onClick ? () => props.onClick && props.onClick(props.row) : () => false
			}
		>
			{props.sortedColumns.map((col, colIndex) => {
				if (col.key === "remove" && col.type === "feature" && !props.row.disabled && props.remove) {
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
				} else {
					return (
						<Cell
							key={colIndex}
							colIndex={colIndex}
							col={col}
							first={props.head.indexOf(col) === 0}
							lastFixed={props.fixedColumns[props.fixedColumns.length - 1] === col}
							order={props.head.indexOf(col)}
							left={getPositionForFixedColumn(props.head.indexOf(col)) + "rem"}
							value={props.row[col.key]}
						/>
					);
				}
			})}
		</tr>
	);
};

function isEqual(p: RowProps, n: RowProps) {
	if (p.withoutMemo) {
		return false;
	} else {
		return p.row._id === n.row._id && Object.keys(p.row).every((key) => p.row[key] === n.row[key]);
	}
}

export default memo(Row, isEqual);
