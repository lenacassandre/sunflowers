import React, { useContext, useState } from "react";

import { Button, RequiredSymbol } from "..";
import { useSunContext } from "../../core/ViewComposer/ViewComposer";

import {ColorList} from "./ColorList/ColorList";
import "./ColorPicker.scss";

export function ColorPicker(props: {
  name: string,
  value?: string,
  onChange?: (color: string) => void,
  className?: string,
  style?: any,
  required?: boolean,
}) {
  const sunContext = useSunContext();

  const [choosenColor, choose] = useState(props.value);

  function handleChange(value: string) {
    if (props.onChange) {
      props.onChange(value);
    }

    choose(value);
  }

    return (
		<div
			className={`ColorPicker${props.className ? ` ${props.className}` : ""}`}
			style={props.style}
		>
			<Button
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				sunContext.modal<string>({
					form: (resolve, _reject) => <ColorList resolve={resolve} />
				})
					.then((color) => handleChange(color))
					.catch(() => {})
			}}
			style={{ backgroundColor: choosenColor ? choosenColor : undefined }}
			className={`colorPickerButton${choosenColor && " choosen"}`}
			>
          		Sélectionner une couleur{props.required && <RequiredSymbol />}
        	</Button>
        	<input
				type="hidden"
				value={choosenColor ? choosenColor : ""}
				name={props.name}
				required={props.required}
			/>
      	</div>
    );
}
