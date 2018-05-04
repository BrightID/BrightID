import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default class Avatar extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Image source={this.props.avatar} style={styles.avatar} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.3,
		shadowRadius: 2
	},
	avatar: {
		width: 145,
		height: 145,
		borderRadius: 72.5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.8,
		shadowRadius: 2
	}
});
