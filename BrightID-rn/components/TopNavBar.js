import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-navigation';

export default class TopNavBar extends React.Component {
	_onPressButton() {
		alert("hi!");
	}
	render() {
		return (
			<SafeAreaView style={styles.container}>
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
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		// flex: 0.2,
		flexDirection: "row",
		backgroundColor: "#d98200",
		alignItems: "flex-end",
		flexDirection: 'row',
		justifyContent: "flex-start",
		height: 64,
		top: 0,
	},
	title: {
		flex: 1,
		marginLeft: "auto",
		marginRight: "auto",
		paddingBottom: 7
	},
	titleText: {
		color: "white",
		textAlign: "center"
	},
	info: {
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 4,
		marginLeft: 12
	},
	infoIcon: {
		color: "white"
	},
	expand: {
		alignItems: "center",
		justifyContent: "center",
		paddingBottom: 4,
		marginRight: 12
	},
	expandIcon: {
		color: "white"
	}
});
