import { StyleSheet, Dimensions } from "react-native";

const vw = Dimensions.get("window").width / 100;
const vh = Dimensions.get("window").height / 100;

const minWidth = 0;
const stepWidth = 5;
const maxWidth = 150;

const minHeight = 0;
const stepHeight = 5;
const maxHeight = 150;

const minPadding = 0;
const stepPadding = 5;
const maxPadding = 50;

const minMargin = 0;
const stepMargin = 5;
const maxMargin = 50;

const maxFlex = 10;

//////////////////////////////////////////////////////////////////////////////////////////////

const layout: StyleSheet.NamedStyles<any> = {
	row: {
		flexDirection: "row",
	},
	col: {
		flexDirection: "column",
	},
	wrap: {
		flexWrap: "wrap",
	},
	nowrap: {
		flexWrap: "nowrap",
	},
	// JUSTIFY CONTENT ///////////////////////////////////////////////////////////////////////////
	jStart: {
		justifyContent: "flex-start",
	},
	jEnd: {
		justifyContent: "flex-end",
	},
	jCenter: {
		justifyContent: "center",
	},
	jSpaceB: {
		justifyContent: "space-between",
	},
	jSpaceA: {
		justifyContent: "space-around",
	},
	jSpaceE: {
		justifyContent: "space-evenly",
	},
	// ALIGN ITEMS ///////////////////////////////////////////////////////////////////////////////
	aiStart: {
		alignItems: "flex-start",
	},
	aiEnd: {
		alignItems: "flex-end",
	},
	aiCenter: {
		alignItems: "center",
	},
	aiStretch: {
		alignItems: "stretch",
	},
	aiBaseline: {
		alignItems: "baseline",
	},
	// ALIGN SELF ///////////////////////////////////////////////////////////////////////////////
	asStart: {
		alignSelf: "flex-start",
	},
	asEnd: {
		alignSelf: "flex-end",
	},
	asCenter: {
		alignSelf: "center",
	},
	asStretch: {
		alignSelf: "stretch",
	},
	// ALIGN CONTENT ///////////////////////////////////////////////////////////////////////////////
	acStart: {
		alignContent: "flex-start",
	},
	acEnd: {
		alignContent: "flex-end",
	},
	acCenter: {
		alignContent: "center",
	},
	acStretch: {
		alignContent: "stretch",
	},
	acSpaceB: {
		alignContent: "space-between",
	},
	acSpaceA: {
		alignContent: "space-around",
	},
};

for (let width = minWidth; width <= maxWidth; width += stepWidth) {
	layout[`w${width}`] = { width };
}

for (let height = minHeight; height <= maxHeight; height += stepHeight) {
	layout[`h${height}`] = { height };
}

for (let width = 0; width <= 100; width += 5) {
	layout[`w${width}vw`] = { width: width * vw };
}

for (let height = 0; height <= 100; height += 5) {
	layout[`h${height}vh`] = { height: height * vh };
}

for (let padding = minPadding; padding <= maxPadding; padding += stepPadding) {
	layout[`p${padding}`] = { padding };
	layout[`pt${padding}`] = { paddingTop: padding };
	layout[`pr${padding}`] = { paddingRight: padding };
	layout[`pb${padding}`] = { paddingBottom: padding };
	layout[`pl${padding}`] = { paddingLeft: padding };
}

for (let margin = minMargin; margin <= maxMargin; margin += stepMargin) {
	layout[`m${margin}`] = { margin };
	layout[`mt${margin}`] = { marginTop: margin };
	layout[`mr${margin}`] = { marginRight: margin };
	layout[`mb${margin}`] = { marginBottom: margin };
	layout[`ml${margin}`] = { marginLeft: margin };
}

for (let flex = 0; flex <= maxFlex; flex += 1) {
	layout[`flex${flex}`] = { flex };
}

export default StyleSheet.create(layout);
