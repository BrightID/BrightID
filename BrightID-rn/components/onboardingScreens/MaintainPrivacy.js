import React from "react";
import { Button, StyleSheet, Image, Text, View } from "react-native";

export default class Onboard extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Image
					source={require("../../static/guy_fox.png")}
					style={styles.guyFox}
				/>
				<Text style={styles.mainText}>Maintain Privacy</Text>
				<Text style={styles.secondaryText}>Prove you're a unique person</Text>
				<Text style={styles.secondaryText}>while preserving your privacy.</Text>
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
		justifyContent: "center"
	},
	guyFox: {
		marginLeft: "auto",
		marginRight: "auto",
		marginTop: -80,
		marginBottom: 40
	},
	mainText: {
		fontSize: 26,
		fontWeight: "bold",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.2,
		shadowRadius: 1.4,
		marginBottom: 20
	},
	secondaryText: {
		fontSize: 18,
		lineHeight: 22
	}
});
