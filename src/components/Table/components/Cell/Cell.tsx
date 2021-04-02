import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Column } from "../../types";

function getContent(value: any, type?: string, table?: { [data: string]: string }) {
	if (type) {
		switch (type.toLowerCase()) {
			case "color": {
				return <div style={{ backgroundColor: value, width: "100%", height: "100%" }}></div>;
			}

			case "number":
			case "string":
			case "text": {
				return value;
			}

			case "boolean": {
				return value ? <FontAwesomeIcon icon={faCheck} className="true" /> : "";
			}

			case "longdate": {
				if (value) {
					if (value.getTime) {
						return value.toLocaleDateString("fr", {
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
				if (value) {
					if (value.getTime) {
						return value.toLocaleDateString("fr", {
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
				if (value) {
					if (value.getTime) {
						return value.toLocaleDateString("fr", {
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
				if (table && table[value]) {
					return table[value];
				} else {
					return value;
				}
			}

			default: {
				return value;
			}
		}
	} else {
		return value;
	}
}

export default function<RowType = {[key: string]: any}>(props: {
	row: RowType
	column: Column<RowType>;
	//value: any;
	//left?: string;
	//order: number;
	//first?: boolean;
	//lastFixed?: boolean;
	index: number;
	//style?: any;
}): JSX.Element {
	// Col.fixed cells are th. Free ones are td.
	const Tag = "td"; //props.col.fixed ? "th" : "td";
	// CELL //////////////////////////////////////////////////

	let style: {
		left?: string;
		order?: number;
		minWidth?: string;
		maxWidth?: string;
		flex?: number;
	} = {};

	/*if (props.col.fixed) {
		style.left = String(props.left);
	}*/

	/*if (props.order) {
		style.order = props.order;
	}*/

	/*if (props.col.size) {
		style.minWidth = String(props.col.size) + "rem";
		style.maxWidth = String(props.col.size) + "rem";
	} else {
		style.flex = 1;
		style.minWidth = "5rem";
	}

	if (props.style) {
		style = { ...style, ...props.style };
	}*/

	const content = props.column.key ? getContent(props.row[props.column.key], props.column.type, props.column.correlation): "";

	return (
		<Tag
			key={props.index}
			className={`${Tag}${/*props.col.fixed ? " fixed" : " free"} ${props.col.key}${props.first ? " first" : ""}${
				props.lastFixed ? " lastFixed" : ""
			*/""}`}
			style={style}
		>
			{props.column.prefix}
			{content}
			{props.column.suffix}
		</Tag>
	);
};
