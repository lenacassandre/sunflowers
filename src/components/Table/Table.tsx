import React, { useEffect, useState } from 'react';
import Row from "./components/Row/Row";
import { Column } from './types'
import "./Table.scss";
import useColumns from './hooks/useColumns';
import useSorting from './hooks/useSorting';

/**
 * Table super component
 *
 * @property `label` - Display name of the column. Default: "".
 * @property `sticked` - The column will stick to the left.
 * @property `prefix` - String to display before data. (only available for text, number, date, file, url, email, phone and function types).
 * @property `suffix` - String to display after data. (only available for text, number, date, file, url, email, phone and function types).
 * @property `typeIcon` - A icon from font-awesome will be added before the label, depending on the type.
 *
 * @property `type` - Data type. Default: "text".
 * @property `key` - Row key to display. (not available for jsx and function types).
 * @property `function` - For each "function" cell in a "function" column, the row will be sent to this function, which will return a string to display. (only available for function type).
 * @property `jsx` - For each "jsx" cell in a "jsx" column, the row will be sent to this function, which will return a react element to display. (only available for jsx type)
 * @property `correlation` - If a correlation object is given, the table will display the string given for the data. Displaying `column.correlation[data]` instead of `data`.
 *
 * @property `edit` - If true, user can directly edit from the cell. If a function is given, it will be called onClick instead of directly allowing editing. If false, nothing append on click.
 * @property `onChange` - Called on each changes if `column.edit = true`.
 * @property `onFinishChange` - Called when the user end the focus on a celle, if `column.edit = true`.
 *
 * @property `search` - Can search.
 * @property `sort` - Can sort.
 * @property `sortingFilter` - Will change the data depending on this function before sorting it.
 */
export function Table<RowType = any>(props: {
	columns: Column<RowType>[];
	rows: RowType[];

	className?: string;
	style?: any;

	limit?: number;
    // TODO : rétablir ces features
	//subs?: boolean;
	//withoutMemo?: boolean;
	//flex?: boolean;

    edit?: boolean | ((row: RowType) => void);
    onChange?: (row: RowType, patch: {[key in keyof RowType]?: RowType[key]}) => void;
    onFinishChange?: (row: RowType, patch: {[key in keyof RowType]?: RowType[key]}) => void;

	valid?: (row: RowType) => boolean;
	warning?: (row: RowType) => boolean;
	error?: (row: RowType) => boolean;

	grab?: boolean;
	actions?: { [actionName: string]: (row: RowType) => void };
}) : JSX.Element {
	const columns = useColumns(props.columns);
	const [rows, sort] = useSorting(props.rows, columns);


	const limitedRows = rows.slice(0, props.limit);

	return (
		<div className={`Table${props.className ? " " + props.className : ""}`} style={props.style}>
			<div className="wrapper">
				<table style={{}}>
					{columns && limitedRows ? (
						<React.Fragment>
							<tbody style={{}}>
								{limitedRows.map((row, index) => (
									<Row<RowType>
                                        key={index} // React key

									    index={index}
										row={row}
										columns={columns}

										actions={props.actions}
										grab={props.grab}
										//sub={props.subs && row.sub}
										//style={rowStyle}
										//withoutMemo={props.withoutMemo}
										//remove={props.remove}
										//onClick={props.onClick}
										warning={props.warning && props.warning(row)}
										error={props.error && props.error(row)}
										valid={props.valid && props.valid(row)}
									/>
								))}
							</tbody>
							<thead style={{}}>
								<tr style={{}}>
									{columns.map((col, index) => {
										return (
											<th
												key={index}
												className={`th ${col.key}`}
												style={{}}
												onClick={() => (col.sort && col.key ? sort(col.key) : () => false)}
											>
												<span>{col.label}</span>
												{col.sort && (
													<div className="icon">

													</div>
												)}
											</th>
										);
									})}
								</tr>
							</thead>
						</React.Fragment>
					) : ""}
				</table>
			</div>
		</div>
	);
};
