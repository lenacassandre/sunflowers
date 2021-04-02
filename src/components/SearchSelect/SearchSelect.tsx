import React, { useContext, useEffect, useRef, useState } from "react";
import "./SearchSelect.scss";

import { Search } from '../Search/Search'
import { Context } from "../ViewComposer/ViewComposer";

/////////////////////////////////////////////////////////////////////////////////////////////////:
// PROPS
type SearchSelectProps<Type> = {
    array: Type[];
    searchKeys: (keyof Type)[];
    name: string;
    value: string;
    display: (item: Type) => string,
    label?: string;
    className?: string;
    icon?: any;
    limit?: number;
    onSelect?: (item: Type) => void,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInputChange?: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN COMPONENT
export function SearchSelect<Type>(props: SearchSelectProps<Type>) {
    const CobblestoneContext = useContext(Context);

    const [state, setState] = useState<{value: string, searchResults: Type[]}>({value: "", searchResults: []})
    const stateRef = useRef(state);
    stateRef.current = state;

    const inputRef = useRef<HTMLInputElement>()

    function handleCallback(searchResults?: Type[], value?: string) {
        console.log("MAIN callback", searchResults?.length, value)

        // default values
        searchResults ||= [];
        value ||= "";

        // Limit results
        searchResults = searchResults.slice(0, props.limit || 10)

        setState({...stateRef.current, searchResults, value: value || ""});

        if(searchResults.length > 0 && typeof value === "string") {
            openFocusMode(searchResults, value)
        }

    }

    function openFocusMode(searchResults: Type[], value: string) {
        const rect = inputRef.current?.getBoundingClientRect()

		if(rect) {
			CobblestoneContext.modal && CobblestoneContext.modal<Type>({
				className: `SearchSelectModal ${props.className || ""}`,
				raw: true,
				delay: 0,
				form: (resolve, reject) =>
					<SearchSelectListModal<Type>
						{...props}

						resolve={resolve}
						reject={reject}

                        searchResults={searchResults}
                        value={stateRef.current.value}

						inputRect={rect}
						inputRef={inputRef}

                        callback={handleCallback}
					/>
			})
				.then((item: Type) => props.onSelect && props.onSelect(item))
				.catch(() => {})
		}
    }

    console.log("MAIN render", state.value)

    return (
        <div className="SearchSelect">
            <Search<Type>
                {...props}
                value={stateRef.current.value}
                callback={handleCallback}
                reference={inputRef}
            />
        </div>
    )
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:
//////////////////////////////////////////////////////////////////////////////////////////////////////////////:

// TODO : repositionner la liste on window.resize. Ca ne marche pas à tous les coups pour l'instant.

function SearchSelectListModal<Type>(props: {
	resolve: (result: Type) => void,
	reject: () => void,

    searchResults: Type[]

	inputRef: React.MutableRefObject<HTMLInputElement | undefined>,
	inputRect: DOMRect,

    callback: (searchResults?: Type[], value?: string) => void
} & SearchSelectProps<Type>) {
	const [state, setState] = useState<{rect: DOMRect, searchResults: Type[], value: string}>({
		rect: props.inputRect,
        value: props.value,
        searchResults: props.searchResults
	})
    const stateRef = useRef(state)
    stateRef.current = state

	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// RESIZE
	// force render
	const resize = () => {
		const newRect = props.inputRef.current?.getBoundingClientRect();
		if(newRect) setState({...stateRef.current, rect: newRect})
	}

	useEffect(() => {
		window.addEventListener("resize", resize);

		return () => {
			window.removeEventListener("resize", resize);
		}
	}, [])

	/////////////////////////////////////////////////////////////////////////////////////////////////
	// ON CLICK

	function handleClick(index: number) {
        props.resolve(state.searchResults[index]);
	}

    ////////////////////////////////////////////////////////////////////////////////////////////
    // HANDLE SEARCH RESULTS CHANGING
    function handleCallback(searchResults?: Type[], value?: string) {
        console.log("MODAL callback", searchResults?.length, value)

        // default values
        searchResults ||= [];
        value ||= "";

        // limit result
        searchResults = searchResults.slice(0, props.limit || 10)

        setState({...stateRef.current, searchResults, value});
        props.callback(searchResults, value);
    }

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// RENDER
	const rect = props.inputRef.current?.getBoundingClientRect() ? stateRef.current.rect : props.inputRect;

	const style: any = {
		left: `${rect.left}px`,
	}

    const inputStyle = {
        ...style,
		top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
    }

    const listStyle = {
        ...style,
		minWidth: `${rect.width}px`,
    }

	if(rect.top < window.innerHeight / 2) {
		listStyle.top = `${rect.top + rect.height}px`;
	}
	else {
		listStyle.bottom = `${window.innerHeight - rect.bottom + rect.height}px`;
	}

    console.log("MODAL render", stateRef.current.value)

	return (
        <>
            <Search<Type>
                {...props}
                style={inputStyle}
                callback={handleCallback}
                value={stateRef.current.value}
                autofocus
            />
            {
                stateRef.current.searchResults.length > 0 && (
                    <ul
                        className="SelectList"
                        style={listStyle}
                    >
                        {stateRef.current.searchResults.map((item, i) => (
                            <li
                                key={i}
                                onClick={() => handleClick(i)}
                            >
                                {props.display(item)}
                            </li>
                        ))}
                    </ul>
                )
            }

        </>
	)
}
