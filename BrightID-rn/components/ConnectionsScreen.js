import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import SearchConnections from "../containers/SearchConnections";
import HeaderButtons from "react-navigation-header-buttons";
import Ionicons from "react-native-vector-icons/Ionicons";

export default class ConnectionsScreen extends React.Component {
	static navigationOptions = {
		title: "Connections"
	};

	render() {
		return (
			<View style={styles.container}>
				<SearchConnections />
				<View style={styles.friend}>
					<Text>Friend1</Text>
				</View>
				<View style={styles.friend}>
					<Text>Friend2</Text>
				</View>
				<View style={styles.friend}>
					<Text>Friend3</Text>
				</View>
				<View style={styles.friend}>
					<Text>Friend4</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "flex-start"
	},
	friend: {
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
