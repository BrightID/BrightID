import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class BottomNav extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Text>Home</Text>
				<Text>Connections</Text>
				<Text>Groups</Text>
				<Text>Notifications</Text>
				<Text>Apps</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		height: 64,
		backgroundColor: "#fff",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
		width: "100%"
	}
});
