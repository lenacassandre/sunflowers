import {useState, useCallback} from 'react'
import { Column } from '../types';

export default function useSorting<RowType = {[key: string]: any}>(
    rows: RowType[],
    columns: Column<RowType>[]
): [RowType[], (key: string) => void] {
    // Garde en mémoire les colonnes triées et leur sens de tri
	const [sortingOrder, setSortingOrder] = useState<{ key: string; reverse: boolean }[]>([]);

    /////////////////////////////////////////////////////////////////////////////////////////////////
	// Au clic sur une colonne triable :
	// - La colonne n'est pas triée => on la tri par ordre croissant en l'ajoutant dans le tableau des colonnes triées.
	// - La colonne est triée par ordre croissant => on la tri par ordre décroissant.
	// - La colonne est triée par ordre décroissant => on la retire du tableau des colonnes triées.
	const sort = useCallback((key: string) => {
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
	}, [sortingOrder])

    /////////////////////////////////////////////////////////////////////////////////////////////////////
	// Check if the key must be sort with a filter. If yes, it does.
	const applyFilter = useCallback((row: any, key: string) => {
		const col = columns.find((c) => c.key === key);

		if (col && col.sortingFilter && row[key]) {
			return col.sortingFilter(row[key]);
		} else if (typeof row[key] === "string") {
			return row[key].toLowerCase();
		} else {
			return row[key];
		}
	}, [sortingOrder, columns])

    /////////////////////////////////////////////////////////////////////////////////////////////////////
	// Return a sorted array depending on the "sorted" and "sortinGorder" states
	const getSortedArray = useCallback(() => {
		let newArray = [...rows];

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
	}, [sortingOrder, rows])

    ////////////////////////////////////////////////////////////////////////////////////////////
    return [getSortedArray(), sort]
}
