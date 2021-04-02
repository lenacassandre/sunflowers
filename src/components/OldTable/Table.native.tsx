import React, { useState } from "react";

import Row from "./Row/Row";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { faSortUp } from "@fortawesome/free-solid-svg-icons";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";

import { Modal, Document } from "../../types";

export type Column = {
	label: string;
	key: string;
	type?: string;
	size?: number;
	sortingFilter?: (cell: any) => any;
	fixed?: boolean;
	sortable?: boolean;
	table?: { [key: string]: any }[];
	prefix?: string;
};

export const OldTable: React.FC<{
	head: Column[];
	array: any[];

	className?: string;
	style?: any;

	limit?: number;
	subs?: boolean;
	withoutMemo?: boolean;
	flex?: boolean;

	modal?: Modal;

	remove?: (row: Document<any>) => void;
	onClick?: (row: any) => void;

	valid?: (row: any) => boolean;
	warning?: (row: any) => boolean;
	error?: (row: any) => boolean;
}> = (props): JSX.Element => {
	// Garde en mémoire les colonnes triées et leur sens de tri
	const [sortingOrder, setSortingOrder] = useState<{ key: string; reverse: boolean }[]>([]);

	let head = props.head;

	// Actions
	// Si un remove à été fourni, on ajoute sa colonne a la fin du head
	if (props.remove) {
		head = [
			...props.head,
			{
				label: "",
				key: "remove",
				type: "feature",
				size: props.head.some((col) => !col.size) ? 4 : undefined,
			},
		];
	}

	///////////////////////////////////////////////////////////////////////////////////////
	// FUNCTIONS //////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////

	// Au clic sur une colonne triable.
	// - La colonne n'est pas triée => on la tri par ordre croissant en l'ajoutant dans le tableau des colonnes triées
	// - La colonne est triée par ordre croissant => on la tri par ordre décroissant
	// - La colonne est triée par ordre décroissant => on la retire du tableau des colonnes triées
	function sort(key: string) {
		const col = sortingOrder.find((c) => c.key === key);

		const getArrayWithoutCol = () => sortingOrder.filter((c) => c.key !== key);
		const getNewCol = (reverse: boolean) => ({ key, reverse });

		// Si on trouve la colonne
		if (col) {
			// Si elle est triée par ordre décroissant
			if (col.reverse) {
				// On retire la colonne du tableau
				setSortingOrder(getArrayWithoutCol());
			}
			// Si elle triée par ordre croissant
			else {
				// On la trie par ordre décroissant, en la remettant au début du tableau
				setSortingOrder([...getArrayWithoutCol(), getNewCol(true)]);
			}
		}
		// Si elle n'était pas dans le tableau des colonnes triées
		else {
			// On l'ajoute au tableau des colonnes triées, par ordre croissant.
			setSortingOrder([...sortingOrder, getNewCol(false)]);
		}
	}

	// Return a sorted array depending on the "sorted" and "sortinGorder" states
	function getSortedArray() {
		let newArray = [...props.array];

		sortingOrder.forEach(({ key, reverse }) => {
			newArray = newArray.sort((a, b) => {
				if (applyFilter(a, key) > applyFilter(b, key)) {
					return reverse ? 1 : -1;
				} else if (applyFilter(a, key) < applyFilter(b, key)) {
					return reverse ? -1 : 1;
				} else {
					return 0;
				}
			});
		});

		return newArray;
	}

	// Check if the key must be sort with a filter. If yes, it does.
	function applyFilter(row: any, key: string) {
		const col: Column | undefined = head.find((c) => c.key === key);

		if (col && col.sortingFilter && row[key]) {
			return col.sortingFilter(row[key]);
		} else if (typeof row[key] === "string") {
			return row[key].toLowerCase();
		} else {
			return row[key];
		}
	}

	// Get the position in rem for each fixed column, depending of their position
	function getPositionForFixedColumn(index: number) {
		const columnsBefore = fixedColumns.slice(0, index);

		if (columnsBefore.length === 0) {
			return 0;
		} else {
			return columnsBefore
				.map((col) => col.size)
				.reduce((total = 0, current?: number) => (current ? total + current : total));
		}
	}

	///////////////////////////////////////////////////////////////////////////////////////
	// RENDER /////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////

	// Définir la largeur totale d'une ligne du tableau
	const totalWidth = head
		.map((col) => col.size)
		.reduce((total = 0, size?: number) => (size ? total + size : total));

	const rowStyle = {
		maxWidth: props.flex ? "100%" : String(totalWidth) + "rem",
		minWidth: props.flex ? "100%" : String(totalWidth) + "rem",
	};

	// Tri du tableau
	const sortedArray = getSortedArray().slice(0, props.limit);

	// Séparer les colonnes fixes des colonnes libres et les réordonner
	const fixedColumns = head.filter((col) => col.fixed);
	const freeColumns = head.filter((col) => !col.fixed);
	const sortedColumns = [freeColumns, fixedColumns].flat();

	return (
		<div className={`TableNew${props.className ? " " + props.className : ""}`} style={props.style}>
			<div className="wrapper">
				<table style={rowStyle}>
					{head && sortedArray ? (
						<>
							{/******************************************************************************/
							/* BODY ************************************************************************/
							/******************************************************************************/}
							<tbody style={rowStyle}>
								{sortedArray.map((row, rowIndex) => (
									<Row
										key={String(rowIndex) + Object.keys(row).map((key) => row[key])}
										head={head}
										sub={props.subs && row.sub}
										rowIndex={rowIndex}
										row={{ ...row }}
										fixedColumns={fixedColumns}
										sortedColumns={sortedColumns}
										style={rowStyle}
										withoutMemo={props.withoutMemo}
										remove={props.remove}
										onClick={props.onClick}
										warning={props.warning && props.warning(row)}
										error={props.error && props.error(row)}
										valid={props.valid && props.valid(row)}
									/>
								))}
							</tbody>
							{/******************************************************************************/
							/* HEAD ************************************************************************/
							/******************************************************************************/}
							<thead style={rowStyle}>
								<tr style={rowStyle}>
									{sortedColumns.map((col, index) => {
										const sorted = sortingOrder.find((s) => s.key === col.key);

										const style: {
											left?: string;
											order: number;
											minWidth?: string;
											maxWidth?: string;
											flex?: number;
										} = {
											left: col.fixed
												? getPositionForFixedColumn(head.indexOf(col)) + "rem"
												: undefined,
											order: head.indexOf(col),
										};

										if (col.size) {
											style.minWidth = String(col.size) + "rem";
											style.maxWidth = String(col.size) + "rem";
										} else {
											style.flex = 1;
										}

										return (
											<th
												key={index}
												className={`th ${col.key}${col.sortable ? " sortable" : ""}${
													col.fixed ? " fixed" : ""
												}${head.indexOf(col) === 0 ? " first" : ""}${
													fixedColumns[fixedColumns.length - 1] === col ? " lastFixed" : ""
												}`}
												style={style}
												onClick={() => (col.sortable ? sort(col.key) : () => false)}
											>
												<span>{col.label}</span>
												{col.sortable && (
													<div className="icon">
														<FontAwesomeIcon
															className="sortIcon"
															icon={
																sorted
																	? sorted.reverse
																		? faSortDown
																		: faSortUp
																	: faSort
															}
															size="sm"
														/>
													</div>
												)}
											</th>
										);
									})}
								</tr>
							</thead>
						</>
					) : // HANDLING MISSING PROPS
					head ? (
						<p>Renseignez le tableau de données dans la prop "array" du composant "Table".</p>
					) : (
						<p>Renseignez le tableau de colonnes dans la prop "head" du composant "Table".</p>
					)}
				</table>
			</div>
		</div>
	);
};
