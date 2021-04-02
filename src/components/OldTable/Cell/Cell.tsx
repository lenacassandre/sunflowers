import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Column } from "../OldTable";
import { Button } from "../../Button/Button";

function getContent<RowType extends {[key: string]: any}>(
	row: RowType,
	col: Column<RowType>,
	remove?: (row: RowType) => any,
	disabled?: boolean // Pour le bouton remove
) {
	if (col.type) {
		switch (col.type.toLowerCase()) {
			case "color": {
				return <div style={{ backgroundColor: row[col.key], width: "100%", height: "100%" }}></div>;
			}

			case "number":
			case "string":
			case "text": {
				return row[col.key];
			}

			case "boolean": {
				return row[col.key] ? <FontAwesomeIcon icon={faCheck} className="true" /> : "";
			}

			case "longdate": {
				if (row[col.key]) {
					if (row[col.key].getTime) {
						return row[col.key].toLocaleDateString("fr", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						});
					} else {
						return "Date invalide";
					}
				} else {
					return "";
				}
			}

			case "date": {
				if (row[col.key]) {
					if (row[col.key].getTime) {
						return row[col.key].toLocaleDateString("fr", {
							weekday: "short",
							day: "numeric",
							month: "short",
							year: "numeric",
						});
					} else {
						return "Date invalide";
					}
				} else {
					return "";
				}
			}

			case "shortdate": {
				if (row[col.key]) {
					if (row[col.key].getTime) {
						return row[col.key].toLocaleDateString("fr", {
							day: "2-digit",
							month: "2-digit",
							year: "2-digit",
						});
					} else {
						return "Date invalide";
					}
				} else {
					return "";
				}
			}

			//table de correspondance
			case "table": {
				if (!Array.isArray(row[col.key]) && col.table && col.table[row[col.key]]) {
					return col.table[row[col.key]];
				} else if (Array.isArray(row[col.key]) && col.table) {
					return row[col.key].reduce((string: string, next: string, i: number) => {
						return `${string}${col.table?.[next]}${i < row[col.key].length - 1 ? ", " : ""}`;
					}, "");
				} else {
					return row[col.key];
				}
			}

			case "function": {
				if(col.function && typeof col.function === "function") {
					return col.function(row)
				} else {
					return String(row[col.key])
				}
			}

			case "feature": {
				if(col.key === "remove") {
					return (
						<Button
							disabled={disabled}
							icon={faTrashAlt}
							className="removeRowButton"
							onClick={(event) => {
								event.stopPropagation();

								if (remove) {
									remove(row);
								}
							}}
							filled
						/>
					)
				}
				break;
			}

			default: {
				return String(row[col.key]);
			}
		}
	} else {
		return String(row[col.key]);
	}
}

export function Cell<RowType>(props: {
	col: Column;
	row: RowType;
	left?: string;
	order: number;
	first?: boolean;
	lastFixed?: boolean;
	colIndex: number;
	style?: any;
	disabled?: boolean;
	remove?: (row: RowType) => void
}): JSX.Element {
	// Col.fixed cells are th. Free ones are td.
	const Tag = props.col.fixed ? "th" : "td";
	// CELL //////////////////////////////////////////////////

	let style: {
		left?: string;
		order?: number;
		minWidth?: string;
		maxWidth?: string;
		flex?: number;
	} = {};

	if (props.col.fixed) {
		style.left = String(props.left);
	}

	if (props.order) {
		style.order = props.order;
	}

	if (props.col.size) {
		style.minWidth = String(props.col.size) + "rem";
		style.maxWidth = String(props.col.size) + "rem";
	} else {
		style.flex = 1;
		style.minWidth = "5rem";
	}

	if (props.style) {
		style = { ...style, ...props.style };
	}

	const content = getContent<RowType>(props.row, props.col, props.remove, props.disabled);

	return (
		<Tag
			key={props.colIndex}
			className={`${Tag}${props.col.fixed ? " fixed" : " free"} ${props.col.key}${props.first ? " first" : ""}${
				props.lastFixed ? " lastFixed" : ""
			}`}
			style={style}
		>
			{props.col.prefix}
			{content}
		</Tag>
	);
};
