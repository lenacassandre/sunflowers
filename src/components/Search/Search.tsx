import React, { useEffect, useState } from "react";
import { Input } from "..";

import "./Search.scss";

// Search component is an extended input which will not return a string,
// but an filtered array

export function Search<Type>(props: {
	array: Type[],
	searchKeys: (keyof Type)[],
	name: string,
	value: string,
	label?: string,
	className?: string,
	icon?: any,
	style?: any,
	reference?: any,
	autofocus?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
	onInputChange?: (value: string) => void,
	onKeyDown?: (event: React.KeyboardEvent) => void,
	onFocus?: (event: React.FocusEvent) => void,
	onBlur?: (event: React.FocusEvent) => void,
	callback?: (result?: Type[], value?: string) => void,
}) {
	// content of the search input field, wrote by the user
	const [content, setContent] = useState("");

	useEffect(() => {
		if(typeof props.value === "string") {
			setContent(props.value);
		}
	}, [props.value])

	//////////////////////////////////////////////////////////////////////////////////
	// Search on change //////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////
	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const string = event.target.value;

		if (props.onChange) {
			props.onChange(event);
		}

		if (props.onInputChange) {
			props.onInputChange(string);
		}

		setContent(string);

		if (string.length > 0) {
			const searchPromise = new Promise<Type[]>((resolve, reject) => {
				// On divise la recherche en mots
				const words = string.trim().toLowerCase().split(" ");

				// Nombre de searchKeys auquelles répondent la valeur
				const searchScore = props.array.map((item) => {
				// Score d'une entrée du tableau
				let score = 0;

				// Pour chaque search key, on voit si l'entrée y répond,
				// si oui, on incrémente son score
				props.searchKeys.forEach((key) => {
					// On fait ça pour chaque mot
					words.forEach((word) => {
						if(item[key]) {
							const objectProperty = String(item[key]).trim().toLowerCase();

							// Incrémente si un searchKey inclue un mot
							if (objectProperty.includes(word)) {
								score += 1;
							}

							// ou si mot inclue un searchKey
							if (word.includes(objectProperty)) {
								score += 1;
							}

							// Incrémente si un mot est égal à un searchKey
							if (objectProperty === word.toLowerCase()) {
								score += 1;
							}

							// Incrémente si la recherche est égal à un searchKey
							if (objectProperty === string.trim().toLowerCase()) {
								score += 1;
							}
						}
					});
				});

				return score;
				});

				const maxScore = Math.max(...searchScore);

				let searchResults: Type[] = [];

				// Build the new array, sorting entries by score
				if (string.length > 0 && maxScore > 0) {
					for (let n = maxScore; n > 0; n -= 1) {
						searchScore.forEach((score, index) => {
							if (score === n) {
								searchResults.push(props.array[index]);
							}
						});
					}
				}

				resolve(searchResults);
			})

			// Lorsque la promesse est terminée
			searchPromise
				.then((results: Type[]) => {
					if (props.callback) {
						props.callback(results, string);
					}
				});
		} else {
			setContent("");
			if(props.callback) {
				props.callback(props.array, string);
			}
		}
	}

  //////////////////////////////////////////////////////////////////////////////////
  // RENDER ////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  return (
    <Input
      value={typeof props.value === "string" ? props.value : content}
      className={`Search${props.className ? " " + props.className : ""}`}
      name={props.name}
	  icon={props.icon}
      onKeyDown={props.onKeyDown}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onChange={handleChange}
      label={props.label}
	  style={props.style}
	  inputRef={props.reference}
	  autofocus={props.autofocus}
    />
  );
}
