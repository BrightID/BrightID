import React from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop trustScore
 * @prop connectionTime
 * @prop avatar
 */

export default class ConnectionCard extends React.Component {
	static propTypes = {
		name: PropTypes.string
	};
	render() {
		return (
			<View style={styles.container}>
				<Text>{this.props.name}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-evenly",
		backgroundColor: "#fff",
		height: 110,
		marginTop: 22,
		shadowColor: "#ccc",
		shadowOffset: { width: 0, height: 7 },
		shadowOpacity: 0.3,
		shadowRadius: 4
	}
});
