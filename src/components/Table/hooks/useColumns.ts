import { useEffect, useState } from 'react';
import { Column } from "../types";

export default function useColumns<RowType>(cols: Column<RowType>[]) {
	const [columns, setColumns] = useState<Column<RowType>[]>([]);

    // Tri les colonnes
    useEffect(() => {
        const sortedColumns = cols.sort((a, b) =>
            a.sticked && !b.sticked ? 1
            : b.sticked && !a.sticked ? -1
            : 0
        );

        setColumns(sortedColumns);
    }, [cols])

    return columns
}