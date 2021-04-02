
import { Button } from "../Button/Button";
import { Item } from "../List/Item/Item";
import { List } from "../List/List";
import { RequiredSymbol } from "../RequiredSymbol/RequiredSymbol";

import React, { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

export const Select: React.FC<{
	name: string;
	values: Array<any>;
	labels: Array<string>;
	value?: any | Array<any>;

	style?: any;
	className?: string;
	label?: string;

	multiple?: boolean;
	required?: boolean;

	all?: string;
	none?: string;
	text?: string;

	onChange?: (v: any) => void;
	displayFilter?: (value: any) => string;
}> = (props): JSX.Element => {
	const ListRef = React.createRef<any>();

	const { value } = props;

	// Définit si la liste apparait ou non
	const [visible, setVisible] = useState(false);
	const visibleRef = useRef(visible);
	visibleRef.current = visible;

	// Selected contient uniquement la valeur de l'élément sélectionné s'il n'est pas "multiple"
	// Selected contient un tablau des valeurs sélectionnées s'il est multiple
	const [selected, setSelected] = useState(props.value ? props.value : props.multiple ? [] : undefined);

	// Réenregistre la valeur actuelle si un évènement extérieur l'a faite changer
	useEffect(() => {
		if (value) {
			setSelected(value);
		}
	}, [value]);

	function set(v: any) {
		setSelected(v);
		if (props.onChange) {
			props.onChange(v);
		}
	}

	// Appelée lors du clic sur une option
	function select(v: any) {
		if (props.multiple) {
			// On retire la valeur cliquée du tableau si elle y était
			if (selected.includes(v)) {
				set(selected.filter((s: any) => s !== v));
			}
			// Sinon, on l'ajoute, en prenant soin de conserver l'ordre du tableau de valeurs
			else {
				const newSelectedArray: any[] = [];

				props.values.forEach((val: any) => {
					if (selected.includes(val) || v === val) {
						newSelectedArray.push(val);
					}
				});

				set(newSelectedArray);
			}
		} else {
			set(v);
			close();
		}
	}

	const open = () => {
		document.addEventListener("click", close);
		setTimeout(() => setVisible(true));
	};

	const close = (e?: MouseEvent) => {
		if (!e || (ListRef.current && !ListRef.current.contains(e.target))) {
			document.removeEventListener("click", close);
			if (visibleRef.current) {
				setVisible(false);
			}
		}
	};

	return (
		<div className={`DropDownSelect${props.className ? ` ${props.className}` : ""}`} style={props.style}>
			{props.label && (
				<label htmlFor={props.name}>
					{props.label}
					{props.required && <RequiredSymbol />}
				</label>
			)}
			<Button
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (!visibleRef.current) {
						open();
					} else {
						close();
					}
				}}
				active={visibleRef.current}
			>
				{
					// On prend en compte le cas ou le DDS n'est pas multiple,
					// le cas où tous les choix sont selectionnés ET qu'un placeholder ALL est donné en props,
					// où aucun choix n'est selectionné ET qu'un placeholder NONE est donné en props,
					// Et enfin le cas ou certain choix sont selectionnés
					props.text
						? props.text
						: !props.multiple && selected && typeof props.displayFilter === "function"
						? props.displayFilter(selected)
						: !props.multiple && selected
						? String(props.labels[props.values.findIndex((item) => item === selected)])
						: selected && selected.length === props.values.length && typeof props.all === "string"
						? String(props.all)
						: ((selected && selected.length === 0) || !selected) && props.none
						? String(props.none)
						: props.multiple && props.displayFilter
						? selected.map((val: any) => (props.displayFilter ? props.displayFilter(val) : "")).join(", ")
						: props.multiple
						? selected.map((val: any) => props.labels[props.values.indexOf(val)]).join(", ")
						: ""
				}
				<FontAwesomeIcon
					className={`dropDownSelectIcon${visibleRef.current ? " visible" : ""}`}
					icon={faCaretDown}
					size="lg"
				/>
			</Button>
			<List className={visibleRef.current ? "visible" : "closed"} listRef={ListRef}>
				{props.labels.map((label: string, index: number) => (
					<Item key={index} onClick={() => select(props.values[index])}>
						{props.multiple && (
							<div
								className={`iconItemMultipleDropDownSelect${
									!selected.includes(props.values[index]) ? " hidden" : ""
								}`}
							>
								<div className="iconLineItemMultipleDropDownSelect" />
								<div className="iconLineItemMultipleDropDownSelect" />
							</div>
						)}
						{label}
					</Item>
				))}
			</List>
			<input
				type="hidden"
				value={selected ? (props.multiple ? JSON.stringify(selected) : selected) : ""}
				name={props.name}
				required={props.required}
			/>
		</div>
	);
};
