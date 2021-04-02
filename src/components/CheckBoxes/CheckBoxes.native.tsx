import React from "react";

import { CheckBox } from "../CheckBox/CheckBox";

type CheckBoxItem = { _id: any; label: string; active?: boolean };

export const CheckBoxes: React.FC<{
	array: Array<CheckBoxItem>;
	onChange?: (selected: Array<any>) => void;
	className?: string;
	value: Array<any>;
	style?: any;
	wrap?: boolean;
	name: string;
}> = (props): JSX.Element => {
	const toggle = (_id: any, c: boolean) => {
		// Si le coposant parent envoie le tableau des valeurs sélectionnée en direct, alors on utilise celui ci.
		// Sinon, on le reproduit à l'aide de la propriété "active" des items du tableau
		const checked: Array<any> = props.value
			? [...props.value]
			: props.array.filter((item) => item.active).map((item) => item._id);

		//On trouve l'index de la nouvelle valeur selectionnée si elle fait déjà partie des valeurs selectionnées
		const index = checked.indexOf(_id);

		// On la retire si c'est le cas
		if (index >= 0) {
			checked.splice(index, 1);

			// On envoie le nouveau tableau des valeurs sélectionnées si le composant parent écoute l'évènement
			if (props.onChange) {
				props.onChange(checked);
			}
		}
		// Si l'item n'était pas sélectionné, on l'ajoute en conservant l'ordre de props.array
		else {
			const newCheckedArray: Array<any> = props.array.reduce((newArray: Array<any>, item: CheckBoxItem): Array<
				any
			> => {
				if (checked.includes(item._id) || item._id === _id) {
					newArray.push(item._id);
				}

				return newArray;
			}, []);

			if (props.onChange) {
				props.onChange(newCheckedArray);
			}
		}
	};

	return (
		<div className={`CheckBoxes${props.className ? " " + props.className : ""}`} style={props.style}>
			{props.array.map((item) => (
				<CheckBox
					wrap={props.wrap}
					key={item._id ? item._id : item.label}
					id={`CheckBox ${item.label}`}
					onChange={(checked: boolean) => toggle(item._id, checked)}
					value={props.value ? props.value.includes(item._id) : item.active}
					label={item.label}
					name={props.name}
				/>
			))}
		</div>
	);
};
