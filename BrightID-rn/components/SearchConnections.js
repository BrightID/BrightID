import React from "react";
import { TextInput, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import Touchable from "react-native-platform-touchable";
import Ionicon from "react-native-vector-icons/Ionicons";

/**
 * Search Bar in the Connections Screen
 */

export default class SearchConnections extends React.Component {
	static propTypes = {
		searchParam: PropTypes.string
	};
	render() {
		return (
			<View style={styles.container}>
				<Touchable onPress={this.focus} style={styles.searchIcon}>
					<Ionicon size={32} name="ios-search-outline" color="#000" />
				</Touchable>
				<TextInput
					value={this.props.searchParam}
					onChangeText={value => this.props.updateParam(value)}
					style={styles.searchField}
				/>
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
		borderWidth: 1
	},
	searchIcon: {
		marginLeft: 5,
		marginRight: 5,
		marginTop: 3,
		justifyContent: "center",
		alignItems: "center",
		height: 40
	},
	searchField: {
		height: 40,
		width: "80%"
	}
});
