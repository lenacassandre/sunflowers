import React, { memo } from "react";

import { Cell } from "../Cell/Cell";

import { Button } from "../../Button/Button";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { Column } from "../OldTable";


export default function Row<RowType>(props: {
	head: Column[];
	rowIndex: number;
	row: RowType;
	fixedColumns: Column[];
	sortedColumns: Column[];
	style: any;
	withoutMemo?: boolean;
	remove?: (row: RowType, index: number) => void;
	onClick?: (row: any, index: number) => void;
	valid?: (row: RowType) => boolean;
	warning?: (row: RowType) => boolean;
	error?: (row: RowType) => boolean;

	// Sous-niveau
	rowChildren?: (row: RowType) => RowType[] | undefined; // Permet de chercher les enfants d'une ligne
	addChild?: (row: RowType) => void;
	subLevel?: number; // Le niveau actuel de la ligne
	maxChildrenLevel?: number; // Le nombre maximum de sous niveau possible dans le tableau
}): JSX.Element {
	const subLevel = props.subLevel || 1;

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

	const rowchildren = props.rowChildren ? props.rowChildren(props.row) : [];

	const warning= props.warning ? props.warning(props.row) : false;
	const error = props.error ? props.error(props.row) : false;
	const valid= props.valid ? props.valid(props.row) : false;

	return (
		<>
			<tr
				key={props.rowIndex}
				style={props.style}
				className={`${props.onClick ? " clickable" : ""}${
					error ? " error" : warning ? " warning" : valid ? " valid" : ""
				} sub${subLevel}`}
				onClick={
					props.onClick ? () => props.onClick && props.onClick(props.row, props.rowIndex) : () => false
				}
			>
				{props.sortedColumns.map((col, colIndex) => {
					if (col.key === "remove" && col.type === "feature" && props.remove) {
						return (
							<Cell
								key={colIndex}
								colIndex={colIndex}
								col={col}
								rowIndex={props.rowIndex}
								first={props.head.indexOf(col) === 0}
								lastFixed={props.fixedColumns[props.fixedColumns.length - 1] === col}
								order={props.head.indexOf(col)}
								left={getPositionForFixedColumn(props.head.indexOf(col)) + "rem"}
								style={{ justifyContent: "flex-end" }}
								row={props.row}
								remove={props.remove}
								disabled={rowchildren && rowchildren.length > 0}
							/>
						);
					} else {
						return (
							<Cell<RowType>
								key={colIndex}
								colIndex={colIndex}
								col={col}
								rowIndex={props.rowIndex}
								first={props.head.indexOf(col) === 0}
								lastFixed={props.fixedColumns[props.fixedColumns.length - 1] === col}
								order={props.head.indexOf(col)}
								left={getPositionForFixedColumn(props.head.indexOf(col)) + "rem"}
								row={props.row}
							/>
						);
					}
				})}
			</tr>
			{
				rowchildren && rowchildren.map((rowChild, i) => (
					<Row<RowType>
						key={String(props.rowIndex) + " " + String(i)}
						head={props.head}
						rowIndex={i}
						row={rowChild}
						fixedColumns={props.fixedColumns}
						sortedColumns={props.sortedColumns}
						style={props.style}
						withoutMemo={props.withoutMemo}
						remove={props.remove}
						onClick={props.onClick}
						warning={props.warning}
						error={props.error}
						valid={props.valid}
						rowChildren={props.rowChildren}
						addChild={props.addChild}
						subLevel={subLevel + 1}
						maxChildrenLevel={props.maxChildrenLevel}
					/>
				))
			}
			{
				props.addChild && (!props.maxChildrenLevel || subLevel < props.maxChildrenLevel) && (
					<tr
						key={props.rowIndex + " add"}
						className={`addChildRow sub${subLevel}`}
					>
						<td>
							<Button
								style={props.style}
								className="addButton"
								icon={faPlus}
								onClick={() => props.addChild && props.addChild(props.row)}
							/>
						</td>
					</tr>
				)
			}
		</>
	);
};


