/**
 * Every column types.
 *
 */
export declare type ColumnType =
"text"
| "number"
| "select"
| "multi-select"
| "date"
| "user"
| "file"
| "image"
| "checkbox"
| "url"
| "email"
| "color"
| "phone"
| "jsx"
| "function"; // (row) => string

// TODO : travailler la taille des colonnes, et le redimensionnage.

/**
 * Everything a column declaration must/can contain.
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
export declare type Column<RowType = {[key: string]: any}> = {
    // Display
    label?: string | JSX.Element;
    sticked?: boolean;
    prefix?: string;
    suffix?: string;
    typeIcon?: boolean;
    width?: string | number;
    flex?: boolean;
    className?: string;

    // Data
    type?: ColumnType;
    key?: string;
    correlation?: {[data: string]: string};
    function?: (row: RowType) => string;
    jsx?: (row: RowType) => JSX.Element;

    // Editing
    edit?: boolean | ((row: RowType) => void);
    onChange?: (row: RowType, patch: {[key in keyof RowType]?: RowType[key]}) => void;
    onFinishChange?: (row: RowType, patch: {[key in keyof RowType]?: RowType[key]}) => void;

    // Features
    search?: boolean;
    sort?: boolean;
    sortingFilter?: (data: any) => any;
}
