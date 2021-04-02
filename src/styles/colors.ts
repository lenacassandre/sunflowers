import { StyleSheet } from "react-native";

const colors = {
	white: "#FFFFFF",
	red: "#e30613",
	blue: "#4EA8DE",
	green: "#7DD0C7",
	lightGreen: "#E0F3F2",
	darkGreen: "#00AD9F",
	lightGrey: "#eae7e1",
	grey: "#d3ccc6",
	darkGrey: "#667385",
	lightBlack: "#2d2a2e",
	darkBlack: "#221f22",
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const processedColors: StyleSheet.NamedStyles<any> = {};

Object.keys(colors).forEach((colorName: string) => {
	processedColors[colorName] = { color: colors[colorName] };
	processedColors[`bg${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`] = {
		backgroundColor: colors[colorName],
	};
	processedColors[`bc${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`] = { borderColor: colors[colorName] };
});

export default StyleSheet.create(processedColors);
