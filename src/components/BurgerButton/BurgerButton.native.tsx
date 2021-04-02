import React from "react";

export const BurgerButton: React.FC<{
	active?: boolean;
	onClick?: (event: React.MouseEvent) => void;
}> = (props) => {
	return (
		<div
			className={`BurgerButton${props.active ? " active" : ""}`}
			onClick={props.onClick ? props.onClick : () => false}
		>
			<div className="icon">
				<div /><div /><div /><div />
			</div>
		</div>
	);
};
