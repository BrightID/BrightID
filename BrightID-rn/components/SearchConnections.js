import React from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import Ionicon from "react-native-vector-icons/Ionicons";

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

export default class SearchConnections extends React.Component {
	static propTypes = {
		searchParam: PropTypes.string
	};
	render() {
		return (
			<View style={styles.container}>
				<Touchable onPress={this.focus} style={styles.searchIcon}>
					<Ionicon size={28} name="ios-search-outline" color="#000" />
				</Touchable>
				<TextInput
					value={this.props.searchParam}
					onChangeText={value => this.props.updateParam(value)}
					style={styles.searchField}
					placeholder="Search Connections"
				/>
				<Touchable onPress={this.focus} style={styles.searchIcon}>
					<Ionicon size={28} name="ios-options-outline" color="#000" />
				</Touchable>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		marginTop: 11,
		marginBottom: 11,
		width: "80%",
		borderColor: "#ccc",
		borderWidth: 1,
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff"
	},
	searchIcon: {
		marginLeft: 5,
		marginRight: 5,
		marginTop: 3,
		// justifyContent: "center",
		// alignItems: "center",
		height: 34
	},
	searchField: {
		height: 34,
		flex: 1

		// width: "80%"
	}
});
