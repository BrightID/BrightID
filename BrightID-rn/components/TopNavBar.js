import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default class TopNavBar extends React.Component {
	_onPressButton() {
		alert("hi!");
	}
	render() {
		return (
			<View style={styles.container}>
				<View style={styles.info}>
					<TouchableOpacity onPress={this._onPressButton}>
						<View style={styles.info}>
							<Text style={styles.infoIcon}>?</Text>
						</View>
					</TouchableOpacity>
				</View>
				<View style={styles.title}>
					<Text style={styles.titleText}>BrightID</Text>
				</View>
				<View style={styles.expand}>
					<TouchableOpacity onPress={this._onPressButton}>
						<View style={styles.expand}>
							<Text style={styles.expandIcon}>...</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		// flex: 0.2,
		flexDirection: "row",
		backgroundColor: "#d98200",
		alignItems: "center",
		justifyContent: "center",
		height: 64
	},
	title: {
		flex: 1,
		marginLeft: "auto",
		marginRight: "auto"
	},
	titleText: {
		color: "white",
		textAlign: "center"
	},
	info: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	infoIcon: {
		color: "white"
	},
	expand: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	expandIcon: {
		color: "white"
	}
});
