import React from "react";
import styled from 'styled-components'

type BurgerButtonProps = {
	active?: boolean;
	onClick?: (event: React.MouseEvent) => void;
}


export const BurgerButton: React.FC<BurgerButtonProps> = (props) => {
	return (
		<Main
			className="BurgerButton"
			onClick={props.onClick ? props.onClick : () => false}
		>
			<Icon className="icon">
				<LineA />
				<LineB />
				<LineC />
				<LineD />
			</Icon>
		</Main>
	);
};

//////////////////////////////////////////////////////////////////////////////////////////

const Main = styled.div`
	width: 3rem;
	height: 3rem;
	border-radius: 1.5rem;

	margin: 0.5rem;

	cursor: pointer;

	display: flex;
	align-items: center;
	justify-content: center;

	transition: all 0.2s ease;
	z-index: 100;
`;

const Icon = styled.div`
	position: relative;
	width: 1.5rem;
	height: 1.25rem;
`;

const Line = styled.div`
	position: absolute;
	height: 0.25rem;
	width: 100%;
	transition: all 0.5s ease;
	border-radius: 0.125rem;
`;

const LineA = styled(Line)<BurgerButtonProps>`
	top: 0;
	transform: ${props => props.active ? "scaleX(0)" : "scaleX(1)"};
`

const LineB = styled(Line)<BurgerButtonProps>`
	top: 0.5rem;
	transform: ${props => props.active ? "rotate(45deg)" : "rotate(0deg)"};
`

const LineC = styled(Line)<BurgerButtonProps>`
	top: 0.5rem;
	transform: ${props => props.active ? "rotate(-45deg)" : "rotate(0deg)"};
`

const LineD = styled(Line)<BurgerButtonProps>`
	top: 1rem;
	transform: ${props => props.active ? "scaleX(0)" : "scaleX(1)"};
`

////////////////////////////////////////////////////////////////////////////////////